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
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ChatMessage.name, schema: ChatMessageSchema },
      { name: ChatRoom.name, schema: ChatRoomSchema },
      { name: ChatConn.name, schema: ChatConnSchema },
    ]),
    JwtModule.registerAsync({
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: parseInt(config.get<string>('JWT_EXPIRES_IN')),
        },
      }),
      inject: [ConfigService],
    }),
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
