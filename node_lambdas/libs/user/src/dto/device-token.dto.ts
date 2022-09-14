import { ApiHideProperty } from '@nestjs/swagger';
import { IsDate, IsMongoId, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateDeviceTokenDto {
  @ApiHideProperty()
  @IsOptional()
  @IsMongoId()
  owner: string;

  @IsString()
  @IsNotEmpty()
  device_token: string;
}

export class UpdateDeviceTokenDto {
  @IsDate()
  @IsNotEmpty()
  updated_at: Date;
}


export class GetDeviceTokenQuery {
  owner?: string;
}
