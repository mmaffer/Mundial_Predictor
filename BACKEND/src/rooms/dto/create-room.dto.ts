import { IsString, IsBoolean, IsInt, Min, Max, MaxLength, IsOptional } from 'class-validator';

export class CreateRoomDto {
  @IsString()
  @MaxLength(60)
  name: string;

  @IsBoolean()
  @IsOptional()
  isPrivate?: boolean;

  @IsInt()
  @Min(2)
  @Max(10000)
  @IsOptional()
  maxMembers?: number;
}
