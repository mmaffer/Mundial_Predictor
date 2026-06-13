import { IsInt, Min, IsOptional } from 'class-validator';

export class SetResultDto {
  @IsInt()
  @Min(0)
  homeScore: number;

  @IsInt()
  @Min(0)
  awayScore: number;

  @IsInt()
  @IsOptional()
  @Min(0)
  homeScoreET?: number;

  @IsInt()
  @IsOptional()
  @Min(0)
  awayScoreET?: number;

  @IsInt()
  @IsOptional()
  @Min(0)
  homePenalties?: number;

  @IsInt()
  @IsOptional()
  @Min(0)
  awayPenalties?: number;
}
