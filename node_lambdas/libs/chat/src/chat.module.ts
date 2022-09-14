import { Module } from '@nestjs/common';
import {
  ChatMessageRepository,
  ChatRoomRepository,
  ChatConnRepository,
} from './repositories';
import {
  ChatMessageService,
  ChatRoomService,
  ChatConnService,
  ChatLambdaService,
} from './services';
import { MongooseModule } from '@nestjs/mongoose';
import {
  ChatConn,
  ChatConnSchema,
  ChatMessage,
  ChatMessageSchema,
  ChatRoom,
  ChatRoomSchema,
} from './entities';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ChatMessage.name, schema: ChatMessageSchema },
      { name: ChatRoom.name, schema: ChatRoomSchema },
      { name: ChatConn.name, schema: ChatConnSchema },
    ]),
  ],
  providers: [
    ChatRoomService,
    ChatMessageService,
    ChatRoomRepository,
    ChatMessageRepository,
    ChatConnService,
    ChatConnRepository,
    ChatLambdaService,
  ],
  exports: [
    ChatRoomService,
    ChatMessageService,
    ChatRoomRepository,
    ChatMessageRepository,
    ChatConnService,
    ChatConnRepository,
    ChatLambdaService,
  ],
})
export class ChatModule {}
