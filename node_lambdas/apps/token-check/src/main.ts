import { NestFactory } from '@nestjs/core';
import { Callback, Context, Handler } from 'aws-lambda';
import { INestApplicationContext } from '@nestjs/common';
import { TokenCheckModule } from './token-check.module';
import { DeviceTokenService } from '@app/user/services/device-token.service';

let app: INestApplicationContext;

async function bootstrap() {
  return await NestFactory.createApplicationContext(TokenCheckModule);
}

export const handler: Handler = async (
  event: any,
  context: Context,
  callback: Callback,
) => {
  if (!app) {
    app = await bootstrap();
  }
  const deviceTokenService = app.get(DeviceTokenService);
  const ret = await deviceTokenService.deleteManyExpired();
  return ret;
};
