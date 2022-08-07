import { IsString, IsPhoneNumber, IsOptional } from 'class-validator';
import { TokenResDto } from '@app/auth';
import { User } from '../entities/user.entity';
import { ApiHideProperty, PickType } from '@nestjs/swagger';

export class CreateUserDto {
  @IsString()
  nickname: string;

  @ApiHideProperty()
  @IsOptional()
  @IsPhoneNumber('KR')
  phone: string;
}

export class UpdateUserDto extends PickType(CreateUserDto, [
  'nickname',
] as const) {
  @IsString()
  thumbnail: string;
}

export class CreateUserResDto {
  user: User;
  token: TokenResDto;
}
