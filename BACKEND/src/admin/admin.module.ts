import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { MatchesModule } from '../matches/matches.module';
import { PredictionsModule } from '../predictions/predictions.module';
import { RankingsModule } from '../rankings/rankings.module';
import { StatisticsModule } from '../statistics/statistics.module';

@Module({
  imports: [MatchesModule, PredictionsModule, RankingsModule, StatisticsModule],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
