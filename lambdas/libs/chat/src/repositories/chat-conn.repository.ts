import { CommonRepository } from '@app/common/common.repository';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateChatConnDto, GetChatConnQuery } from '../dto';
import { ChatConn, ChatConnDocument } from '../entities';

@Injectable()
export class ChatConnRepository extends CommonRepository<
  ChatConn,
  CreateChatConnDto,
  any,
  GetChatConnQuery
> {
  constructor(
    @InjectModel(ChatConn.name) private chatConnModel: Model<ChatConnDocument>,
  ) {
    super(chatConnModel);
  }

  async findOneByConnId(connectionId: string) {
    return this.chatConnModel.findOne({ connection_id: connectionId });
  }

  async deleteMany(query: any) {
    await this.chatConnModel.deleteMany(query);
  }
}
