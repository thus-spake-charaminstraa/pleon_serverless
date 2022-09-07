import { Injectable } from '@nestjs/common';
import { CommonService } from '@app/common';
import { ChatMessage } from '../entities';
import { CreateChatMessageDto, GetChatMessageQuery } from '../dto';
import { ChatMessageRepository } from '../repositories';

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
