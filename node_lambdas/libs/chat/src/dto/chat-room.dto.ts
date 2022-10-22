import { PartialType, PickType } from '@nestjs/swagger';
import {
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { ChatRoom } from '../entities/chat-room.entity';
import { ChatRoomKind } from '../types/chat-room.type';

export class CreateChatRoomDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsEnum(ChatRoomKind)
  kind: ChatRoomKind;

  @IsMongoId({ each: true })
  participant_ids: string[];

  @IsOptional()
  @IsMongoId()
  plant_id: string;

  @IsOptional()
  @IsString()
  thumbnail: string;
}

export class UpdateChatRoomDto extends PartialType(
  PickType(CreateChatRoomDto, [
    'title',
    'participant_ids',
    'thumbnail',
  ] as const),
) {}

export class GetChatRoomQuery {
  participant?: string;
}

export class CreateChatRoomResDto {
  data: ChatRoom;
  statusCode = 201;
}

export class UpdateChatRoomResDto {
  data: ChatRoom;
}

export class GetChatRoomResDto {
  data: ChatRoom[];
}
