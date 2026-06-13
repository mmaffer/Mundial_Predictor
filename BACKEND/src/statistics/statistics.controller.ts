import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { StatisticsService } from './statistics.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Role } from '@prisma/client';

@Controller('statistics')
@UseGuards(RolesGuard)
export class StatisticsController {
  constructor(private statisticsService: StatisticsService) {}

  @Get('me')
  getMyStats(@CurrentUser('id') userId: string) {
    return this.statisticsService.getMyStats(userId);
  }

  @Get('platform')
  @Roles(Role.ADMIN)
  getPlatformStats() {
    return this.statisticsService.getPlatformStats();
  }

  @Get('user/:userId')
  getUserStats(@Param('userId') userId: string) {
    return this.statisticsService.getUserStats(userId);
  }
}
