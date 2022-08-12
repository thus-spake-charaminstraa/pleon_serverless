import { NotiService } from '@app/noti';
import { HttpStatus } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { Callback, Context, Handler } from 'aws-lambda';
import { NotiLambdaModule } from './noti-lambda.module';

export const handler: Handler = async (
  event: any,
  context: Context,
  callback: Callback,
) => {
  const appContext = await NestFactory.createApplicationContext(NotiLambdaModule);
  const notiService = appContext.get(NotiService);

  return {
    body: await notiService.sendNotiForPlants(),
    statusCode: HttpStatus.OK,
  };
};
