import { NestFactory } from '@nestjs/core';
import {
  Callback,
  Context,
  Handler,
  APIGatewayProxyWebsocketEventV2,
} from 'aws-lambda';
import { INestApplicationContext } from '@nestjs/common';
import { ChatLambdaService } from '@app/chat/services';
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
  console.log(app);
  const chatLambdaService = app.get(ChatLambdaService);
  console.log(chatLambdaService);
  const ret = await chatLambdaService.connect(event);
  console.log(ret);
  return ret;
};

bootstrap();