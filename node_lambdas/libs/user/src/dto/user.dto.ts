import { IsString, IsPhoneNumber, IsOptional } from 'class-validator';
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
}

export class CreateUserResDto {
  user: User;
  token: TokenResDto;
}

export class GetUserDto extends User {
  device_tokens: DeviceToken[];
}
