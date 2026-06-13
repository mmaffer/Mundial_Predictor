import { Injectable, NotFoundException, BadRequestException, ForbiddenException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { JoinRoomDto } from './dto/join-room.dto';

function generateCode(length = 6): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

const ROOM_INCLUDE = {
  createdBy: { select: { id: true, username: true, firstName: true } },
  _count: { select: { members: true } },
};

@Injectable()
export class RoomsService {
  constructor(private prisma: PrismaService) {}

  async findPublic(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [rooms, total] = await Promise.all([
      this.prisma.room.findMany({
        where: { isPrivate: false, isActive: true },
        include: ROOM_INCLUDE,
        orderBy: { members: { _count: 'desc' } },
        skip,
        take: limit,
      }),
      this.prisma.room.count({ where: { isPrivate: false, isActive: true } }),
    ]);
    return { rooms, total, page, limit };
  }

  async findMyRooms(userId: string) {
    return this.prisma.room.findMany({
      where: { members: { some: { userId } }, isActive: true },
      include: {
        ...ROOM_INCLUDE,
        members: {
          where: { userId },
          select: { roomPoints: true, roomRank: true, joinedAt: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const room = await this.prisma.room.findUnique({ where: { id }, include: ROOM_INCLUDE });
    if (!room || !room.isActive) throw new NotFoundException('Room not found');
    return room;
  }

  async create(userId: string, dto: CreateRoomDto) {
    let code: string;
    let attempts = 0;

    do {
      code = generateCode();
      attempts++;
      if (attempts > 10) throw new BadRequestException('Could not generate unique code, try again');
    } while (await this.prisma.room.findUnique({ where: { code } }));

    const room = await this.prisma.room.create({
      data: {
        name: dto.name,
        code,
        isPrivate: dto.isPrivate ?? true,
        maxMembers: dto.maxMembers ?? 20,
        creatorId: userId,
      },
      include: ROOM_INCLUDE,
    });

    await this.prisma.roomMember.create({ data: { roomId: room.id, userId } });
    return room;
  }

  async join(userId: string, dto: JoinRoomDto) {
    const room = await this.prisma.room.findUnique({ where: { code: dto.code } });
    if (!room || !room.isActive) throw new NotFoundException('Room not found');

    const memberCount = await this.prisma.roomMember.count({ where: { roomId: room.id } });
    if (memberCount >= room.maxMembers) throw new BadRequestException('Room is full');

    const existing = await this.prisma.roomMember.findUnique({
      where: { roomId_userId: { roomId: room.id, userId } },
    });
    if (existing) throw new ConflictException('Already a member of this room');

    const userPoints = await this.prisma.user.findUnique({ where: { id: userId }, select: { totalPoints: true } });

    await this.prisma.roomMember.create({
      data: { roomId: room.id, userId, roomPoints: userPoints?.totalPoints ?? 0 },
    });

    return this.findOne(room.id);
  }

  async leave(roomId: string, userId: string) {
    const room = await this.findOne(roomId);
    if (room.createdBy.id === userId) {
      throw new BadRequestException('Creator cannot leave the room. Delete it instead.');
    }

    const member = await this.prisma.roomMember.findUnique({
      where: { roomId_userId: { roomId, userId } },
    });
    if (!member) throw new NotFoundException('Not a member of this room');

    await this.prisma.roomMember.delete({ where: { roomId_userId: { roomId, userId } } });
    return { message: 'Left room successfully' };
  }

  async delete(roomId: string, userId: string, isAdmin: boolean) {
    const room = await this.findOne(roomId);
    if (room.createdBy.id !== userId && !isAdmin) {
      throw new ForbiddenException('Only the room creator can delete this room');
    }

    await this.prisma.room.update({ where: { id: roomId }, data: { isActive: false } });
    return { message: 'Room deleted' };
  }

  async getMembers(roomId: string, page = 1, limit = 50) {
    await this.findOne(roomId);
    const skip = (page - 1) * limit;
    const [members, total] = await Promise.all([
      this.prisma.roomMember.findMany({
        where: { roomId },
        include: { user: { select: { id: true, username: true, firstName: true, avatarUrl: true, totalPoints: true } } },
        orderBy: { roomPoints: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.roomMember.count({ where: { roomId } }),
    ]);
    return { members, total, page, limit };
  }

  async removeMember(roomId: string, targetUserId: string, requesterId: string, isAdmin: boolean) {
    const room = await this.findOne(roomId);
    if (room.createdBy.id !== requesterId && !isAdmin) {
      throw new ForbiddenException('Only the room creator can remove members');
    }
    await this.prisma.roomMember.delete({
      where: { roomId_userId: { roomId, userId: targetUserId } },
    });
    return { message: 'Member removed' };
  }
}
