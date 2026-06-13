import { Injectable } from '@nestjs/common';
import { MatchStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { MatchesService } from '../matches/matches.service';
import { SetResultDto } from '../matches/dto/set-result.dto';
import { ScoringService } from '../predictions/scoring.service';
import { RankingsService } from '../rankings/rankings.service';
import { StatisticsService } from '../statistics/statistics.service';

@Injectable()
export class AdminService {
  constructor(
    private prisma: PrismaService,
    private matchesService: MatchesService,
    private scoringService: ScoringService,
    private rankingsService: RankingsService,
    private statisticsService: StatisticsService,
  ) {}

  async getDashboardStats() {
    const platform = await this.statisticsService.getPlatformStats();

    const recentEvents = await this.prisma.scoreHistory.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: { user: { select: { username: true } } },
    });

    const recentUsers = await this.prisma.user.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: { id: true, username: true, email: true, createdAt: true, totalPoints: true, isBanned: true },
    });

    return { platform, recentEvents, recentUsers };
  }

  getUsers(page = 1, limit = 20, search?: string) {
    const skip = (page - 1) * limit;
    const where = search
      ? { OR: [{ email: { contains: search } }, { username: { contains: search } }], deletedAt: null }
      : { deletedAt: null };

    return this.prisma.user.findMany({
      where,
      select: {
        id: true, email: true, username: true, firstName: true, lastName: true,
        role: true, totalPoints: true, isBanned: true, isActive: true, createdAt: true,
        _count: { select: { predictions: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    });
  }

  getMatches(status?: MatchStatus) {
    return this.prisma.match.findMany({
      where: status ? { status } : {},
      include: {
        homeTeam: true,
        awayTeam: true,
        stadium: true,
        _count: { select: { predictions: true } },
      },
      orderBy: { scheduledAt: 'asc' },
    });
  }

  getRooms(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    return this.prisma.room.findMany({
      include: {
        createdBy: { select: { username: true } },
        _count: { select: { members: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    });
  }

  async setMatchResult(matchId: string, dto: SetResultDto) {
    const match = await this.matchesService.setResult(matchId, dto);
    await this.scoringService.scoreMatch(matchId);
    await this.rankingsService.refreshGlobalRanks();
    return { match, message: 'Result set and scores calculated' };
  }

  async recalculateAll() {
    const finishedMatches = await this.prisma.match.findMany({
      where: { status: MatchStatus.FINISHED, homeScore: { not: null } },
      select: { id: true },
    });

    for (const m of finishedMatches) {
      await this.prisma.prediction.updateMany({
        where: { matchId: m.id },
        data: { status: 'PENDING', pointsExact: 0, pointsWinner: 0, pointsDiff: 0, pointsEarly: 0, pointsStreak: 0, totalPoints: 0 },
      });
    }

    for (const m of finishedMatches) {
      await this.scoringService.scoreMatch(m.id);
    }

    await this.rankingsService.refreshGlobalRanks();
    return { recalculated: finishedMatches.length };
  }
}
