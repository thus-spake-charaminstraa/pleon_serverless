import { NestFactory } from '@nestjs/core';
import { configure as serverlessExpress } from '@vendia/serverless-express';
import { Callback, Context, Handler } from 'aws-lambda';
import { CommonService } from '@app/common';
import { PlantLambdaModule } from './plant-lambda.module';

let server: Handler;

(async () => {
  server = server ?? (await bootstrap());
})();

async function bootstrap(): Promise<Handler> {
  const app = await NestFactory.create(PlantLambdaModule);
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
