import { User } from '@app/user/entities/user.entity';
import { IsEmail, IsString } from 'class-validator';

export class RefreshTokenDto {
  @IsString()
  refresh_token: string;
}

export class TokenResDto {
  access_token: string;
  refresh_token: string;
}

export class CreateTokenResDto {
  user: User;
  token: TokenResDto;
}
