import { Controller, Get, Param } from '@nestjs/common';
import { TeamsService } from './teams.service';

@Controller('teams')
export class TeamsController {
  constructor(private teamsService: TeamsService) {}

  @Get()
  findAll() {
    return this.teamsService.findAll();
  }

  @Get('groups')
  findGroups() {
    return this.teamsService.findGroups();
  }

  @Get('group/:group')
  findByGroup(@Param('group') group: string) {
    return this.teamsService.findByGroup(group);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.teamsService.findOne(id);
  }
}
