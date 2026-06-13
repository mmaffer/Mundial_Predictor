import { IsString, Length, Matches } from 'class-validator';

export class JoinRoomDto {
  @IsString()
  @Length(4, 12)
  @Matches(/^[A-Z0-9]+$/, { message: 'Code must be uppercase alphanumeric' })
  code: string;
}
