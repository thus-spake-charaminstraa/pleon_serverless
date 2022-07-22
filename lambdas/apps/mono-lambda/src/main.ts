import { NestFactory } from '@nestjs/core';
import { configure as serverlessExpress } from '@vendia/serverless-express';
import { Callback, Context, Handler } from 'aws-lambda';
import { MonoLambdaModule } from './mono-lambda.module';
import { CommonService } from '@app/common';

let server: Handler;

async function bootstrap(): Promise<Handler> {
  const app = await NestFactory.create(MonoLambdaModule);
  CommonService.prepareNestApp(app);
  await app.init();

  const expressApp = app.getHttpAdapter().getInstance();
  return serverlessExpress({ app: expressApp });
}

export const handler: Handler = async (
  event: any,
  context: Context,
  callback: Callback,
) => {
  if (!server) {
    const start = new Date().getTime();
    server = await bootstrap();
    console.log('bootstrap : ', new Date().getTime() - start, 'ms');
  }
  return server(event, context, callback);
};
