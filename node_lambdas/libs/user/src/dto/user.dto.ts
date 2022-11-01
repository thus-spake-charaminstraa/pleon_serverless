import {
  IsString,
  IsPhoneNumber,
  IsOptional,
  IsBoolean,
} from 'class-validator';
import { TokenResDto } from '@app/auth/dto/token.dto';
import { User } from '../entities/user.entity';
import { ApiHideProperty, PartialType, PickType } from '@nestjs/swagger';
import { DeviceToken } from '../entities/device-token.entity';

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

  @IsBoolean()
  comment_push_noti: boolean;

  @IsBoolean()
  guide_push_noti: boolean;
}

export class CreateUserResDto {
  user: User;
  token: TokenResDto;
}

export class GetUserDto extends User {
  device_tokens: DeviceToken[];
}
