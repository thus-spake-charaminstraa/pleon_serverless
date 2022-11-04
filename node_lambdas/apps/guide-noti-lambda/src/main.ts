import { GuideService } from '@app/plant/services/guide.service';
import { HttpStatus } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { Callback, Context, Handler } from 'aws-lambda';
import { GuideNotiLambdaModule } from './guide-noti-lambda.module';

let guideService: GuideService;

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(GuideNotiLambdaModule);
  await app.init();
  const guideService = app.get(GuideService);
  return guideService;
}

export const handler: Handler = async (
  event: any,
  context: Context,
  callback: Callback,
) => {
  if (!guideService) {
    const t = new Date().getTime();
    guideService = await bootstrap();
    console.log('bootstrap time: ', new Date().getTime() - t, 'ms');
  }
  return {
    body: await guideService.sendNotiForPlants({}),
    statusCode: HttpStatus.OK,
  };
};
