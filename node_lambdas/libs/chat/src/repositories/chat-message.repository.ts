import { CommonRepository } from '@app/common/common.repository';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateChatMessageDto, GetChatMessageQuery } from '../dto/chat-message.dto';
import { ChatMessage, ChatMessageDocument } from '../entities/chat-message.entity';

@Injectable()
export class ChatMessageRepository extends CommonRepository<
  ChatMessage,
  CreateChatMessageDto,
  any,
  GetChatMessageQuery
> {
  constructor(
    @InjectModel(ChatMessage.name) model: Model<ChatMessageDocument>,
  ) {
    super(model);
  }
}
