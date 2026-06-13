import { Controller, Get, Post, Delete, Body, Param, Query, UseGuards, ParseIntPipe, DefaultValuePipe } from '@nestjs/common';
import { RoomsService } from './rooms.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { JoinRoomDto } from './dto/join-room.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Role } from '@prisma/client';

@Controller('rooms')
@UseGuards(RolesGuard)
export class RoomsController {
  constructor(private roomsService: RoomsService) {}

  @Get()
  findPublic(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    return this.roomsService.findPublic(page, limit);
  }

  @Get('my')
  findMine(@CurrentUser('id') userId: string) {
    return this.roomsService.findMyRooms(userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.roomsService.findOne(id);
  }

  @Post()
  create(@CurrentUser('id') userId: string, @Body() dto: CreateRoomDto) {
    return this.roomsService.create(userId, dto);
  }

  @Post('join')
  join(@CurrentUser('id') userId: string, @Body() dto: JoinRoomDto) {
    return this.roomsService.join(userId, dto);
  }

  @Delete(':id/leave')
  leave(@Param('id') roomId: string, @CurrentUser('id') userId: string) {
    return this.roomsService.leave(roomId, userId);
  }

  @Delete(':id')
  delete(
    @Param('id') roomId: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') role: Role,
  ) {
    return this.roomsService.delete(roomId, userId, role === Role.ADMIN);
  }

  @Get(':id/members')
  getMembers(
    @Param('id') roomId: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit: number,
  ) {
    return this.roomsService.getMembers(roomId, page, limit);
  }

  @Delete(':id/members/:userId')
  removeMember(
    @Param('id') roomId: string,
    @Param('userId') targetUserId: string,
    @CurrentUser('id') requesterId: string,
    @CurrentUser('role') role: Role,
  ) {
    return this.roomsService.removeMember(roomId, targetUserId, requesterId, role === Role.ADMIN);
  }
}
