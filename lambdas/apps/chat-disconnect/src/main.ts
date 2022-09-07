import { NestFactory } from '@nestjs/core';
import {
  Callback,
  Context,
  Handler,
  APIGatewayProxyWebsocketEventV2,
} from 'aws-lambda';
import { INestApplicationContext } from '@nestjs/common';
import { ChatLambdaService } from '@app/chat/services';
import { ChatDisconnectModule } from './chat-disconnect.module';

let app: INestApplicationContext;

async function bootstrap() {
  return await NestFactory.createApplicationContext(ChatDisconnectModule);
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
  const ret = await chatLambdaService.disconnect(event);
  console.log(ret);
  return ret;
};
