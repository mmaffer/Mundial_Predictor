import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { Role } from '@prisma/client';

const PUBLIC_SELECT = {
  id: true, email: true, username: true, firstName: true, lastName: true,
  role: true, avatarUrl: true, country: true, totalPoints: true,
  streak: true, maxStreak: true, globalRank: true, createdAt: true,
};

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where: { deletedAt: null },
        select: PUBLIC_SELECT,
        orderBy: { totalPoints: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.user.count({ where: { deletedAt: null } }),
    ]);
    return { users, total, page, limit, pages: Math.ceil(total / limit) };
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findFirst({
      where: { id, deletedAt: null },
      select: PUBLIC_SELECT,
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async update(id: string, dto: UpdateUserDto, requesterId: string, requesterRole: Role) {
    if (requesterId !== id && requesterRole !== Role.ADMIN) {
      throw new ForbiddenException('Cannot update another user\'s profile');
    }
    await this.findOne(id);
    return this.prisma.user.update({
      where: { id },
      data: dto,
      select: PUBLIC_SELECT,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.user.update({
      where: { id },
      data: { deletedAt: new Date(), isActive: false },
      select: { id: true },
    });
  }

  async ban(id: string, reason?: string) {
    await this.findOne(id);
    return this.prisma.user.update({
      where: { id },
      data: { isBanned: true, bannedAt: new Date(), bannedReason: reason },
      select: PUBLIC_SELECT,
    });
  }

  async unban(id: string) {
    await this.findOne(id);
    return this.prisma.user.update({
      where: { id },
      data: { isBanned: false, bannedAt: null, bannedReason: null },
      select: PUBLIC_SELECT,
    });
  }
}
