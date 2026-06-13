import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RankingsService {
  constructor(private prisma: PrismaService) {}

  async getGlobal(page = 1, limit = 50) {
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where: { deletedAt: null, isActive: true, isBanned: false },
        select: {
          id: true, username: true, firstName: true, lastName: true,
          avatarUrl: true, country: true, totalPoints: true, streak: true,
        },
        orderBy: { totalPoints: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.user.count({ where: { deletedAt: null, isActive: true, isBanned: false } }),
    ]);

    const ranked = users.map((u, i) => ({ ...u, rank: skip + i + 1 }));

    return { rankings: ranked, total, page, limit, pages: Math.ceil(total / limit) };
  }

  async getMyRank(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { totalPoints: true },
    });
    if (!user) throw new NotFoundException('User not found');

    const rank = await this.prisma.user.count({
      where: { totalPoints: { gt: user.totalPoints }, deletedAt: null, isActive: true },
    });

    return { rank: rank + 1, totalPoints: user.totalPoints };
  }

  async getRoomRanking(roomId: string, page = 1, limit = 50) {
    const skip = (page - 1) * limit;

    const room = await this.prisma.room.findUnique({ where: { id: roomId } });
    if (!room) throw new NotFoundException('Room not found');

    const [members, total] = await Promise.all([
      this.prisma.roomMember.findMany({
        where: { roomId },
        include: {
          user: {
            select: { id: true, username: true, firstName: true, avatarUrl: true, country: true, totalPoints: true },
          },
        },
        orderBy: { roomPoints: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.roomMember.count({ where: { roomId } }),
    ]);

    const ranked = members.map((m, i) => ({
      rank: skip + i + 1,
      roomPoints: m.roomPoints,
      joinedAt: m.joinedAt,
      user: m.user,
    }));

    return {
      room: { id: room.id, name: room.name, code: room.code },
      rankings: ranked,
      total,
      page,
      limit,
    };
  }

  async refreshGlobalRanks() {
    const users = await this.prisma.user.findMany({
      where: { deletedAt: null, isActive: true },
      orderBy: { totalPoints: 'desc' },
      select: { id: true },
    });

    await this.prisma.$transaction(
      users.map((u, i) =>
        this.prisma.user.update({ where: { id: u.id }, data: { globalRank: i + 1 } }),
      ),
    );

    return { updated: users.length };
  }
}
