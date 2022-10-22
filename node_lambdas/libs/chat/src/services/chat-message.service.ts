import { Injectable } from '@nestjs/common';
import { CommonService } from '@app/common/common.service';
import { ChatMessage } from '../entities/chat-message.entity';
import {
  CreateChatMessageDto,
  GetChatMessageQuery,
} from '../dto/chat-message.dto';
import { ChatMessageRepository } from '../repositories/chat-message.repository';

@Injectable()
export class ChatMessageService extends CommonService<
  ChatMessage,
  CreateChatMessageDto,
  any,
  GetChatMessageQuery
> {
  constructor(chatMessageRepository: ChatMessageRepository) {
    super(chatMessageRepository);
  }
}
