import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { MatchStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePredictionDto } from './dto/create-prediction.dto';
import { ScoringService } from './scoring.service';

const LOCK_MINUTES = 10;
const EARLY_BONUS_HOURS = 24;

@Injectable()
export class PredictionsService {
  constructor(
    private prisma: PrismaService,
    private scoring: ScoringService,
  ) {}

  async findMyPredictions(userId: string) {
    return this.prisma.prediction.findMany({
      where: { userId },
      include: {
        match: { include: { homeTeam: true, awayTeam: true } },
      },
      orderBy: { submittedAt: 'desc' },
    });
  }

  async findMyPredictionForMatch(userId: string, matchId: string) {
    return this.prisma.prediction.findUnique({
      where: { userId_matchId: { userId, matchId } },
      include: { match: { include: { homeTeam: true, awayTeam: true } } },
    });
  }

  async create(userId: string, dto: CreatePredictionDto) {
    const match = await this.prisma.match.findUnique({ where: { id: dto.matchId } });
    if (!match) throw new NotFoundException('Match not found');

    if (match.status === MatchStatus.FINISHED || match.status === MatchStatus.CANCELLED) {
      throw new BadRequestException('Cannot predict a finished or cancelled match');
    }

    const lockAt = new Date(match.scheduledAt.getTime() - LOCK_MINUTES * 60 * 1000);
    if (new Date() >= lockAt) {
      throw new BadRequestException('Predictions are locked 10 minutes before kick-off');
    }

    const existing = await this.prisma.prediction.findUnique({
      where: { userId_matchId: { userId, matchId: dto.matchId } },
    });

    if (existing) throw new ConflictException('You already have a prediction for this match');

    const earlyBonusDeadline = new Date(match.scheduledAt.getTime() - EARLY_BONUS_HOURS * 60 * 60 * 1000);
    const isEarlyBonus = new Date() <= earlyBonusDeadline;

    return this.prisma.prediction.create({
      data: {
        userId,
        matchId: dto.matchId,
        homeScore: dto.homeScore,
        awayScore: dto.awayScore,
        isEarlyBonus,
      },
      include: { match: { include: { homeTeam: true, awayTeam: true } } },
    });
  }

  async update(userId: string, matchId: string, homeScore: number, awayScore: number) {
    const prediction = await this.prisma.prediction.findUnique({
      where: { userId_matchId: { userId, matchId } },
      include: { match: true },
    });

    if (!prediction) throw new NotFoundException('Prediction not found');
    if (prediction.status === 'SCORED') throw new BadRequestException('Prediction already scored');

    const lockAt = new Date(prediction.match.scheduledAt.getTime() - LOCK_MINUTES * 60 * 1000);
    if (new Date() >= lockAt) {
      throw new BadRequestException('Predictions are locked 10 minutes before kick-off');
    }

    const earlyBonusDeadline = new Date(prediction.match.scheduledAt.getTime() - EARLY_BONUS_HOURS * 60 * 60 * 1000);
    const isEarlyBonus = new Date() <= earlyBonusDeadline;

    return this.prisma.prediction.update({
      where: { userId_matchId: { userId, matchId } },
      data: { homeScore, awayScore, isEarlyBonus },
      include: { match: { include: { homeTeam: true, awayTeam: true } } },
    });
  }

  async scoreMatchPredictions(matchId: string) {
    await this.scoring.scoreMatch(matchId);
    return { message: 'Match predictions scored successfully' };
  }

  async findByMatch(matchId: string) {
    return this.prisma.prediction.findMany({
      where: { matchId },
      include: { user: { select: { id: true, username: true, firstName: true } } },
      orderBy: { totalPoints: 'desc' },
    });
  }
}
