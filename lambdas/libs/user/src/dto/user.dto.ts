import { IsString, IsPhoneNumber, IsOptional } from 'class-validator';
import { TokenResDto } from '@app/auth';
import { User } from '../entities/user.entity';
import { ApiHideProperty, PartialType, PickType } from '@nestjs/swagger';

export class CreateUserDto {
  @IsString()
  nickname: string;

  @ApiHideProperty()
  @IsOptional()
  @IsPhoneNumber('KR')
  phone: string;
}

export class UpdateUserDto extends PartialType(
  PickType(CreateUserDto, ['nickname'] as const),
) {
  @IsString()
  thumbnail: string;
}

export class CreateUserResDto {
  user: User;
  token: TokenResDto;
}
