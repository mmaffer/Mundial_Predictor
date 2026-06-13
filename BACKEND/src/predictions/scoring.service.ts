import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface PointBreakdown {
  exact: number;
  winner: number;
  diff: number;
  early: number;
  streak: number;
  total: number;
}

@Injectable()
export class ScoringService {
  constructor(private prisma: PrismaService) {}

  calculateMatchPoints(
    predHome: number,
    predAway: number,
    resultHome: number,
    resultAway: number,
  ): Pick<PointBreakdown, 'exact' | 'winner' | 'diff'> {
    // Rule 1: Exact score → +5 pts
    if (predHome === resultHome && predAway === resultAway) {
      return { exact: 5, winner: 0, diff: 0 };
    }

    let winner = 0;
    let diff = 0;

    // Rule 2: Correct winner → +3 pts (Math.sign: 1=home, 0=draw, -1=away)
    if (Math.sign(predHome - predAway) === Math.sign(resultHome - resultAway)) {
      winner = 3;
    }

    // Rule 3: Correct goal difference (signed) → +2 pts
    if (predHome - predAway === resultHome - resultAway) {
      diff = 2;
    }

    return { exact: 0, winner, diff };
  }

  async scoreMatch(matchId: string): Promise<void> {
    const match = await this.prisma.match.findUnique({
      where: { id: matchId },
      include: { predictions: { include: { user: true } } },
    });

    if (!match || match.homeScore === null || match.awayScore === null) return;

    const resultHome = match.homeScore;
    const resultAway = match.awayScore;

    for (const prediction of match.predictions) {
      if (prediction.status === 'SCORED') continue;

      const { exact, winner, diff } = this.calculateMatchPoints(
        prediction.homeScore,
        prediction.awayScore,
        resultHome,
        resultAway,
      );

      const early = prediction.isEarlyBonus ? 1 : 0;
      const baseTotal = exact + winner + diff + early;

      await this.prisma.prediction.update({
        where: { id: prediction.id },
        data: {
          status: 'SCORED',
          pointsExact: exact,
          pointsWinner: winner,
          pointsDiff: diff,
          pointsEarly: early,
          totalPoints: baseTotal,
        },
      });

      if (baseTotal > 0) {
        await this.prisma.scoreHistory.create({
          data: {
            userId: prediction.userId,
            matchId,
            points: baseTotal,
            reason: exact > 0 ? 'exact_score' : winner > 0 ? 'correct_winner' : 'goal_diff',
            detail: `${match.homeScore}-${match.awayScore} (pred: ${prediction.homeScore}-${prediction.awayScore})`,
          },
        });
      }
    }

    // Recalculate streaks for all affected users
    const userIds = [...new Set(match.predictions.map((p) => p.userId))];
    for (const userId of userIds) {
      await this.recalculateUserStreak(userId);
    }

    // Refresh global points for all affected users
    for (const userId of userIds) {
      await this.refreshUserTotalPoints(userId);
    }
  }

  private async recalculateUserStreak(userId: string): Promise<void> {
    const predictions = await this.prisma.prediction.findMany({
      where: { userId, status: 'SCORED' },
      include: { match: { select: { scheduledAt: true } } },
      orderBy: { match: { scheduledAt: 'asc' } },
    });

    let streak = 0;
    let maxStreak = 0;
    let streakBonusTotal = 0;

    // Reset all streak points first
    for (const pred of predictions) {
      await this.prisma.prediction.update({
        where: { id: pred.id },
        data: { pointsStreak: 0 },
      });
    }

    for (const pred of predictions) {
      const isCorrect = pred.pointsExact > 0 || pred.pointsWinner > 0;

      if (isCorrect) {
        streak++;
        if (streak > maxStreak) maxStreak = streak;

        // Every 3rd consecutive hit → +2 streak bonus
        if (streak % 3 === 0) {
          await this.prisma.prediction.update({
            where: { id: pred.id },
            data: { pointsStreak: 2 },
          });
          streakBonusTotal += 2;

          await this.prisma.scoreHistory.upsert({
            where: { id: `streak-${pred.id}` },
            update: { points: 2 },
            create: {
              id: `streak-${pred.id}`,
              userId,
              matchId: pred.matchId,
              points: 2,
              reason: 'streak_bonus',
              detail: `Streak of ${streak}`,
            },
          });
        }
      } else {
        streak = 0;
      }
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: { streak, maxStreak },
    });
  }

  private async refreshUserTotalPoints(userId: string): Promise<void> {
    const result = await this.prisma.prediction.aggregate({
      where: { userId, status: 'SCORED' },
      _sum: { pointsExact: true, pointsWinner: true, pointsDiff: true, pointsEarly: true, pointsStreak: true },
    });

    const total =
      (result._sum.pointsExact ?? 0) +
      (result._sum.pointsWinner ?? 0) +
      (result._sum.pointsDiff ?? 0) +
      (result._sum.pointsEarly ?? 0) +
      (result._sum.pointsStreak ?? 0);

    await this.prisma.user.update({ where: { id: userId }, data: { totalPoints: total } });

    // Also update room points for this user
    const memberships = await this.prisma.roomMember.findMany({ where: { userId } });
    for (const m of memberships) {
      await this.prisma.roomMember.update({
        where: { id: m.id },
        data: { roomPoints: total },
      });
    }
  }
}
