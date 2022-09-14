import { NotiService } from '@app/noti';
import { HttpStatus } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { Callback, Context, Handler } from 'aws-lambda';
import { NotiLambdaModule } from './noti-lambda.module';

let notiService: NotiService;

async function bootstrap() {
  const app = await NestFactory.create(NotiLambdaModule);
  const notiService = app.get(NotiService);
  return notiService;
}

export const handler: Handler = async (
  event: any,
  context: Context,
  callback: Callback,
) => {
  if (!notiService) {
    const t = new Date().getTime();
    notiService = await bootstrap();
    console.log('bootstrap time: ', new Date().getTime() - t, 'ms');
  }
  return {
    body: await notiService.sendNotiForPlants(),
    statusCode: HttpStatus.OK,
  };
};
