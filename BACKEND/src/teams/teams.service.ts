import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TeamsService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.team.findMany({ orderBy: [{ groupName: 'asc' }, { name: 'asc' }] });
  }

  async findOne(id: string) {
    const team = await this.prisma.team.findUnique({ where: { id } });
    if (!team) throw new NotFoundException('Team not found');
    return team;
  }

  findByGroup(group: string) {
    return this.prisma.team.findMany({
      where: { groupName: group.toUpperCase() },
      orderBy: { name: 'asc' },
    });
  }

  findGroups() {
    return this.prisma.team.groupBy({
      by: ['groupName', 'confederation'],
      _count: { id: true },
      orderBy: { groupName: 'asc' },
    });
  }
}
