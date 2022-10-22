import { NestFactory } from '@nestjs/core';
import { configure as serverlessExpress } from '@vendia/serverless-express';
import { Callback, Context, Handler } from 'aws-lambda';
import { MonoAppModule } from './mono-app.module';
import { TransformInterceptor } from '@app/common/interceptors/transform.interceptor';
import { ValidationPipe } from '@nestjs/common';

let server: Handler;

async function bootstrap(): Promise<Handler> {
  const app = await NestFactory.create(MonoAppModule);

  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });

  // use validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  // use response interceptor
  app.useGlobalInterceptors(new TransformInterceptor());

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
  if (event.body === 'warming') {
    console.log('warming up...');
    return {
      statusCode: 200,
      body: 'warming',
    };
  }
  return server(event, context, callback);
};
