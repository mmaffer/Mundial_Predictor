import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { MatchStatus, MatchPhase } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMatchDto } from './dto/create-match.dto';
import { SetResultDto } from './dto/set-result.dto';

const MATCH_INCLUDE = {
  homeTeam: true,
  awayTeam: true,
  stadium: true,
};

@Injectable()
export class MatchesService {
  constructor(private prisma: PrismaService) {}

  findAll(filters: { status?: MatchStatus; group?: string; phase?: MatchPhase }) {
    return this.prisma.match.findMany({
      where: {
        ...(filters.status && { status: filters.status }),
        ...(filters.group && { groupName: filters.group.toUpperCase() }),
        ...(filters.phase && { phase: filters.phase }),
      },
      include: MATCH_INCLUDE,
      orderBy: { scheduledAt: 'asc' },
    });
  }

  async findOne(id: string) {
    const match = await this.prisma.match.findUnique({ where: { id }, include: MATCH_INCLUDE });
    if (!match) throw new NotFoundException('Match not found');
    return match;
  }

  findUpcoming(limit = 10) {
    return this.prisma.match.findMany({
      where: { status: MatchStatus.SCHEDULED, scheduledAt: { gte: new Date() } },
      include: MATCH_INCLUDE,
      orderBy: { scheduledAt: 'asc' },
      take: limit,
    });
  }

  findLive() {
    return this.prisma.match.findMany({
      where: { status: MatchStatus.LIVE },
      include: MATCH_INCLUDE,
      orderBy: { scheduledAt: 'asc' },
    });
  }

  create(dto: CreateMatchDto) {
    return this.prisma.match.create({
      data: {
        homeTeamId: dto.homeTeamId,
        awayTeamId: dto.awayTeamId,
        stadiumId: dto.stadiumId,
        phase: dto.phase ?? MatchPhase.GROUP,
        groupName: dto.groupName,
        matchday: dto.matchday,
        scheduledAt: new Date(dto.scheduledAt),
      },
      include: MATCH_INCLUDE,
    });
  }

  async setLive(id: string) {
    await this.findOne(id);
    return this.prisma.match.update({
      where: { id },
      data: { status: MatchStatus.LIVE },
      include: MATCH_INCLUDE,
    });
  }

  async setResult(id: string, dto: SetResultDto) {
    const match = await this.findOne(id);

    if (match.status === MatchStatus.FINISHED) {
      throw new BadRequestException('Match result already set');
    }

    return this.prisma.match.update({
      where: { id },
      data: {
        status: MatchStatus.FINISHED,
        homeScore: dto.homeScore,
        awayScore: dto.awayScore,
        homeScoreET: dto.homeScoreET,
        awayScoreET: dto.awayScoreET,
        homePenalties: dto.homePenalties,
        awayPenalties: dto.awayPenalties,
        resultUpdatedAt: new Date(),
      },
      include: MATCH_INCLUDE,
    });
  }

  isLocked(scheduledAt: Date): boolean {
    const lockTime = new Date(scheduledAt.getTime() - 10 * 60 * 1000);
    return new Date() >= lockTime;
  }
}
