import { NestFactory } from '@nestjs/core';
import { configure as serverlessExpress } from '@vendia/serverless-express';
import { Callback, Context, Handler } from 'aws-lambda';
import { AuthLambdaModule } from './auth-lambda.module';
import { CommonService } from '@app/common';

let server: Handler;

(async () => {
  const start = new Date().getTime();
  server = server ?? (await bootstrap());
  console.log('bootstrap : ', new Date().getTime() - start, 'ms');
})();

async function bootstrap(): Promise<Handler> {
  const app = await NestFactory.create(AuthLambdaModule);
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
  server = server ?? (await bootstrap());
  return server(event, context, callback);
};
