import { NestFactory } from '@nestjs/core';
import {
  Callback,
  Context,
  Handler,
  APIGatewayProxyWebsocketEventV2,
} from 'aws-lambda';
import { INestApplicationContext } from '@nestjs/common';
import { ChatLambdaService } from '@app/chat/services/chat-lambda.service';
import { ChatConnectModule } from './chat-connect.module';

let app: INestApplicationContext;

async function bootstrap() {
  return await NestFactory.createApplicationContext(ChatConnectModule);
}

export const handler: Handler = async (
  event: any,
  context: Context,
  callback: Callback,
) => {
  if (!app) {
    app = await bootstrap();
  }
  const chatLambdaService = app.get(ChatLambdaService);
  const ret = await chatLambdaService.connect(event);
  return ret;
};
