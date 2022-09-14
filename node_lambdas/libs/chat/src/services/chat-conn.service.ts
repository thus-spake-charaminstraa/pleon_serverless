import { Injectable, NotFoundException } from '@nestjs/common';
import { CommonService } from '@app/common';
import { CreateChatConnDto, GetChatConnQuery } from '../dto';
import { ChatConnRepository } from '../repositories';
import { ChatConn } from '../entities';

@Injectable()
export class ChatConnService extends CommonService<
  ChatConn,
  CreateChatConnDto,
  any,
  GetChatConnQuery
> {
  constructor(private chatConnRepository: ChatConnRepository) {
    super(chatConnRepository);
  }

  async deleteConn(connectionId: string) {
    await this.chatConnRepository.deleteMany({ connection_id: connectionId });
  }

  async getChatRoomIdByConnId(connectionId: string) {
    const chatConn = await this.chatConnRepository.findOneByConnId(connectionId);
    if (!chatConn) {
      throw new NotFoundException('Chat connection not found');
    }
    return chatConn.chat_room_id;
  }
}
