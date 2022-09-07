import { Injectable } from '@nestjs/common';
import { CommonService } from '@app/common';
import { CreateChatRoomDto, GetChatRoomQuery, UpdateChatRoomDto } from '../dto';
import { ChatRoomRepository } from '../repositories';
import { ChatRoom } from '../entities';

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
