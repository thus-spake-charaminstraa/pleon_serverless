import { CommonRepository } from '@app/common/common.repository';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateChatMessageDto, GetChatMessageQuery } from '../dto';
import { ChatMessage, ChatMessageDocument } from '../entities';

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
