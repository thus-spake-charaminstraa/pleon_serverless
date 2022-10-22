import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CommonRepository } from '@app/common/common.repository';
import { ChatRoom, ChatRoomDocument } from '../entities/chat-room.entity';
import {
  CreateChatRoomDto,
  GetChatRoomQuery,
  UpdateChatRoomDto,
} from '../dto/chat-room.dto';

@Injectable()
export class ChatRoomRepository extends CommonRepository<
  ChatRoom,
  CreateChatRoomDto,
  UpdateChatRoomDto,
  GetChatRoomQuery
> {
  constructor(@InjectModel(ChatRoom.name) model: Model<ChatRoomDocument>) {
    super(model);
  }
}
