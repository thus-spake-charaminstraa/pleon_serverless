import {
  IsString,
  IsPhoneNumber,
  IsOptional,
  IsBoolean,
  IsEmail,
} from 'class-validator';
import { TokenResDto } from '@app/auth/dto/token.dto';
import { User } from '../entities/user.entity';
import { ApiHideProperty, PartialType, PickType } from '@nestjs/swagger';
import { DeviceToken } from '../entities/device-token.entity';

export class CreateUserDto {
  @IsOptional()
  @IsString()
  nickname: string;

  @ApiHideProperty()
  @IsOptional()
  @IsPhoneNumber('KR')
  phone: string;

  @ApiHideProperty()
  @IsOptional()
  @IsEmail()
  email: string;

  @ApiHideProperty()
  @IsOptional()
  @IsString()
  kakao_id: string;
}

export class UpdateUserDto extends PartialType(
  PickType(CreateUserDto, ['nickname'] as const),
) {
  @IsOptional()
  @IsString()
  thumbnail?: string;

  @IsOptional()
  @IsBoolean()
  comment_push_noti?: boolean;

  @IsOptional()
  @IsBoolean()
  guide_push_noti?: boolean;
}

export class CreateUserResDto {
  user: User;
  token: TokenResDto;
}

export class GetUserDto extends User {
  device_tokens: DeviceToken[];
}
