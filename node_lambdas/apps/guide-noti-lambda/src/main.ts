import { GuideService } from '@app/plant/services/guide.service';
import { HttpStatus, INestApplicationContext } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { Callback, Context, Handler } from 'aws-lambda';
import { GuideNotiLambdaModule } from './guide-noti-lambda.module';
import { DeviceTokenService } from '@app/user/services/device-token.service';

let app: INestApplicationContext;

async function bootstrap() {
  return await NestFactory.createApplicationContext(GuideNotiLambdaModule, {
    logger: process.env.NODE_ENV === 'test' ? ['error', 'warn'] : ['error'],
  });
}

export const handler: Handler = async (
  event: any,
  context: Context,
  callback: Callback,
) => {
  if (!app) {
    app = await bootstrap();
  }
  const guideService = app.get(GuideService);
  const deviceTokenService = app.get(DeviceTokenService);

  await deviceTokenService.deleteDuplicated();
  return {
    body: await guideService.sendNotiForPlants({}),
    statusCode: HttpStatus.OK,
  };
};

export const testHandler = (testingApp: INestApplicationContext) => {
  app = testingApp;
  return handler;
};
