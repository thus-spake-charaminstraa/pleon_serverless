import { ApiHideProperty, PartialType, PickType } from '@nestjs/swagger';
import { IsMongoId, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { SuccessResponse } from '@app/common/dto';
import { ChatConn } from '../entities';

export class CreateChatConnDto {
  @ApiHideProperty()
  @IsOptional()
  @IsMongoId()
  user_id: string;

  @ApiHideProperty()
  @IsOptional()
  @IsMongoId()
  chat_room_id: string;

  @IsString()
  @IsNotEmpty()
  connection_id: string;
}

export class GetChatConnQuery {
  user_id?: string;

  chat_room_id?: string;

  connection_id?: string;
}

export class CreateChatConnResDto extends SuccessResponse {
  data: ChatConn;
  statusCode = 201;
}

export class GetChatConnResDto extends SuccessResponse {
  data: ChatConn[];
}
