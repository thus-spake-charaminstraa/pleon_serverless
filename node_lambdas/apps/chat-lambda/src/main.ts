import { NestFactory } from '@nestjs/core';
import { ChatLambdaModule } from './chat-lambda.module';
import {
  Callback,
  Context,
  Handler,
  APIGatewayProxyWebsocketEventV2,
} from 'aws-lambda';
import { INestApplicationContext } from '@nestjs/common';
import { ChatLambdaService } from '@app/chat/services';

let app: INestApplicationContext;

async function bootstrap() {
  return await NestFactory.createApplicationContext(ChatLambdaModule);
}

export const handler: Handler = async (
  event: APIGatewayProxyWebsocketEventV2,
  context: Context,
  callback: Callback,
) => {
  if (!app) {
    app = await bootstrap();
  }
  const chatLambdaService = app.get(ChatLambdaService);
  const ret = await chatLambdaService.handle(event);
  return ret;
};
