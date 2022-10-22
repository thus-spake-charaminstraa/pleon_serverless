import { Injectable } from '@nestjs/common';
import { CommonService } from '@app/common/common.service';
import {
  CreateChatRoomDto,
  GetChatRoomQuery,
  UpdateChatRoomDto,
} from '../dto/chat-room.dto';
import { ChatRoomRepository } from '../repositories/chat-room.repository';
import { ChatRoom } from '../entities/chat-room.entity';

@Injectable()
export class ChatRoomService extends CommonService<
  ChatRoom,
  CreateChatRoomDto,
  UpdateChatRoomDto,
  GetChatRoomQuery
> {
  constructor(chatRoomRepository: ChatRoomRepository) {
    super(chatRoomRepository);
  }
}
