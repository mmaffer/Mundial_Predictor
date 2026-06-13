import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class StatisticsService {
  constructor(private prisma: PrismaService) {}

  async getMyStats(userId: string) {
    return this.getUserStats(userId);
  }

  async getUserStats(userId: string) {
    const user = await this.prisma.user.findFirst({
      where: { id: userId, deletedAt: null },
      select: {
        id: true, username: true, firstName: true, totalPoints: true,
        streak: true, maxStreak: true, globalRank: true,
      },
    });
    if (!user) throw new NotFoundException('User not found');

    const predictions = await this.prisma.prediction.findMany({
      where: { userId },
      include: { match: { include: { homeTeam: true, awayTeam: true } } },
    });

    const scored = predictions.filter((p) => p.status === 'SCORED');
    const total = scored.length;
    const exact = scored.filter((p) => p.pointsExact > 0).length;
    const correct = scored.filter((p) => p.pointsExact > 0 || p.pointsWinner > 0).length;
    const accuracy = total > 0 ? ((correct / total) * 100).toFixed(1) : '0.0';

    const recentActivity = await this.prisma.scoreHistory.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    // Best predicted teams: teams where user has highest accuracy
    const teamStats: Record<string, { name: string; flag: string; correct: number; total: number }> = {};
    for (const pred of scored) {
      const home = pred.match.homeTeam;
      const away = pred.match.awayTeam;
      const isCorrect = pred.pointsExact > 0 || pred.pointsWinner > 0;

      for (const team of [home, away]) {
        if (!teamStats[team.id]) {
          teamStats[team.id] = { name: team.name, flag: team.flagEmoji, correct: 0, total: 0 };
        }
        teamStats[team.id].total++;
        if (isCorrect) teamStats[team.id].correct++;
      }
    }

    const bestTeams = Object.values(teamStats)
      .map((t) => ({ ...t, accuracy: t.total > 0 ? Math.round((t.correct / t.total) * 100) : 0 }))
      .sort((a, b) => b.accuracy - a.accuracy)
      .slice(0, 5);

    return {
      user,
      kpis: {
        totalPoints: user.totalPoints,
        totalPredictions: total,
        exactScores: exact,
        correctWinners: correct,
        accuracyPercent: parseFloat(accuracy),
        currentStreak: user.streak,
        maxStreak: user.maxStreak,
        globalRank: user.globalRank,
      },
      bestPredictedTeams: bestTeams,
      recentActivity,
    };
  }

  async getPlatformStats() {
    const [totalUsers, totalPredictions, totalRooms, liveMatches] = await Promise.all([
      this.prisma.user.count({ where: { deletedAt: null } }),
      this.prisma.prediction.count(),
      this.prisma.room.count({ where: { isActive: true } }),
      this.prisma.match.count({ where: { status: 'LIVE' } }),
    ]);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const predictionsToday = await this.prisma.prediction.count({
      where: { submittedAt: { gte: today } },
    });

    return { totalUsers, totalPredictions, predictionsToday, totalRooms, liveMatches };
  }
}
