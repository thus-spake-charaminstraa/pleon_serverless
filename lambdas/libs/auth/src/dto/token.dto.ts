import { IsEmail, IsString } from 'class-validator';

export class RefreshTokenDto {
  @IsString()
  refresh_token: string;
}

export class CreateTokenResDto {
  access_token: string;
  refresh_token: string;
}
