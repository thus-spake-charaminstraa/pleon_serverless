import { ApiHideProperty, PartialType, PickType } from '@nestjs/swagger';
import { IsMongoId, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { SuccessResponse } from '@app/common/dto';
import { ChatMessage } from '../entities';

export class CreateChatMessageDto {
  @IsMongoId()
  chat_room_id: string;

  @ApiHideProperty()
  @IsOptional()
  @IsMongoId()
  owner: string;

  @ApiHideProperty()
  @IsOptional()
  @IsMongoId()
  plant_id: string;

  @IsString()
  @IsNotEmpty()
  content: string;
}

export class UpdateChatMessageDto extends PartialType(
  PickType(CreateChatMessageDto, ['content'] as const),
) {}

export class GetChatMessageQuery {
  chat_room_id?: string;

  owner?: string;

  plant_id?: string;
}

export class CreateChatMessageResDto extends SuccessResponse {
  data: ChatMessage;
  statusCode = 201;
}

export class UpdateChatMessageResDto extends SuccessResponse {
  data: ChatMessage;
}

export class GetChatMessageResDto extends SuccessResponse {
  data: ChatMessage[];
}
