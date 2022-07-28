import { IsString, IsPhoneNumber, IsOptional } from 'class-validator';
import { CreateTokenResDto } from '@app/auth';
import { User } from '../entities/user.entity';
import { ApiHideProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @IsString()
  nickname: string;

  @ApiHideProperty()
  @IsOptional()
  @IsPhoneNumber('KR')
  phone: string;
}

export class CreateUserResDto {
  user: User;
  token: CreateTokenResDto;
}
