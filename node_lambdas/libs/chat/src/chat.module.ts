import { Module } from '@nestjs/common';

import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ChatMessage, ChatMessageSchema } from './entities/chat-message.entity';
import { ChatRoom, ChatRoomSchema } from './entities/chat-room.entity';
import { ChatConn, ChatConnSchema } from './entities/chat-conn.entity';
import { ChatRoomService } from './services/chat-room.service';
import { ChatMessageService } from './services/chat-message.service';
import { ChatRoomRepository } from './repositories/chat-room.repository';
import { ChatMessageRepository } from './repositories/chat-message.repository';
import { ChatConnService } from './services/chat-conn.service';
import { ChatConnRepository } from './repositories/chat-conn.repository';
import { ChatLambdaService } from './services/chat-lambda.service';

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
