import { IsString, IsDateString, IsEnum, IsOptional, IsInt, Min } from 'class-validator';
import { MatchPhase } from '@prisma/client';

export class CreateMatchDto {
  @IsString()
  homeTeamId: string;

  @IsString()
  awayTeamId: string;

  @IsString()
  @IsOptional()
  stadiumId?: string;

  @IsEnum(MatchPhase)
  @IsOptional()
  phase?: MatchPhase;

  @IsString()
  @IsOptional()
  groupName?: string;

  @IsInt()
  @IsOptional()
  @Min(1)
  matchday?: number;

  @IsDateString()
  scheduledAt: string;
}
