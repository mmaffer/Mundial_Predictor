import { Controller, Get, Post, Param, Query, UseGuards, ParseIntPipe, DefaultValuePipe } from '@nestjs/common';
import { RankingsService } from './rankings.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Role } from '@prisma/client';

@Controller('rankings')
@UseGuards(RolesGuard)
export class RankingsController {
  constructor(private rankingsService: RankingsService) {}

  @Get('global')
  getGlobal(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit: number,
  ) {
    return this.rankingsService.getGlobal(page, limit);
  }

  @Get('me')
  getMyRank(@CurrentUser('id') userId: string) {
    return this.rankingsService.getMyRank(userId);
  }

  @Get('room/:roomId')
  getRoomRanking(
    @Param('roomId') roomId: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit: number,
  ) {
    return this.rankingsService.getRoomRanking(roomId, page, limit);
  }

  @Post('refresh')
  @Roles(Role.ADMIN)
  refreshRanks() {
    return this.rankingsService.refreshGlobalRanks();
  }
}
