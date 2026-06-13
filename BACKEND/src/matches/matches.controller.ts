import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { MatchesService } from './matches.service';
import { CreateMatchDto } from './dto/create-match.dto';
import { SetResultDto } from './dto/set-result.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { MatchPhase, MatchStatus, Role } from '@prisma/client';

@Controller('matches')
@UseGuards(RolesGuard)
export class MatchesController {
  constructor(private matchesService: MatchesService) {}

  @Get()
  findAll(
    @Query('status') status?: MatchStatus,
    @Query('group') group?: string,
    @Query('phase') phase?: MatchPhase,
  ) {
    return this.matchesService.findAll({ status, group, phase });
  }

  @Get('upcoming')
  findUpcoming(@Query('limit') limit?: string) {
    return this.matchesService.findUpcoming(limit ? parseInt(limit) : 10);
  }

  @Get('live')
  findLive() {
    return this.matchesService.findLive();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.matchesService.findOne(id);
  }

  @Post()
  @Roles(Role.ADMIN)
  create(@Body() dto: CreateMatchDto) {
    return this.matchesService.create(dto);
  }

  @Post(':id/live')
  @Roles(Role.ADMIN)
  setLive(@Param('id') id: string) {
    return this.matchesService.setLive(id);
  }

  @Post(':id/result')
  @Roles(Role.ADMIN)
  setResult(@Param('id') id: string, @Body() dto: SetResultDto) {
    return this.matchesService.setResult(id, dto);
  }
}
