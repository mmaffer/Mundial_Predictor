import { Controller, Get, Post, Body, Param, Query, UseGuards, DefaultValuePipe, ParseIntPipe } from '@nestjs/common';
import { AdminService } from './admin.service';
import { SetResultDto } from '../matches/dto/set-result.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { MatchStatus, Role } from '@prisma/client';

@Controller('admin')
@UseGuards(RolesGuard)
@Roles(Role.ADMIN)
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Get('dashboard')
  getDashboard() {
    return this.adminService.getDashboardStats();
  }

  @Get('users')
  getUsers(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('search') search?: string,
  ) {
    return this.adminService.getUsers(page, limit, search);
  }

  @Get('matches')
  getMatches(@Query('status') status?: MatchStatus) {
    return this.adminService.getMatches(status);
  }

  @Get('rooms')
  getRooms(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    return this.adminService.getRooms(page, limit);
  }

  @Post('matches/:id/result')
  setMatchResult(@Param('id') id: string, @Body() dto: SetResultDto) {
    return this.adminService.setMatchResult(id, dto);
  }

  @Post('recalculate')
  recalculateAll() {
    return this.adminService.recalculateAll();
  }
}
