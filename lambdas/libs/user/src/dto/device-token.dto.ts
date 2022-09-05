import { ApiHideProperty } from '@nestjs/swagger';
import { IsMongoId, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateDeviceTokenDto {
  @ApiHideProperty()
  @IsOptional()
  @IsMongoId()
  owner: string;

  @IsString()
  @IsNotEmpty()
  device_token: string;
}

export class GetDeviceTokenQuery {
  owner?: string;
}
