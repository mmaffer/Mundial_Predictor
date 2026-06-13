import { Controller, Get, Post, Patch, Body, Param, UseGuards } from '@nestjs/common';
import { PredictionsService } from './predictions.service';
import { CreatePredictionDto } from './dto/create-prediction.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Role } from '@prisma/client';

@Controller('predictions')
@UseGuards(RolesGuard)
export class PredictionsController {
  constructor(private predictionsService: PredictionsService) {}

  @Get()
  findMine(@CurrentUser('id') userId: string) {
    return this.predictionsService.findMyPredictions(userId);
  }

  @Get('match/:matchId')
  findMyPredictionForMatch(
    @CurrentUser('id') userId: string,
    @Param('matchId') matchId: string,
  ) {
    return this.predictionsService.findMyPredictionForMatch(userId, matchId);
  }

  @Get('match/:matchId/all')
  @Roles(Role.ADMIN)
  findAllForMatch(@Param('matchId') matchId: string) {
    return this.predictionsService.findByMatch(matchId);
  }

  @Post()
  create(@CurrentUser('id') userId: string, @Body() dto: CreatePredictionDto) {
    return this.predictionsService.create(userId, dto);
  }

  @Patch(':matchId')
  update(
    @CurrentUser('id') userId: string,
    @Param('matchId') matchId: string,
    @Body('homeScore') homeScore: number,
    @Body('awayScore') awayScore: number,
  ) {
    return this.predictionsService.update(userId, matchId, homeScore, awayScore);
  }

  @Post('score/:matchId')
  @Roles(Role.ADMIN)
  scoreMatch(@Param('matchId') matchId: string) {
    return this.predictionsService.scoreMatchPredictions(matchId);
  }
}
