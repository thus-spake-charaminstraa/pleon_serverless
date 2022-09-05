import { NestFactory } from '@nestjs/core';
import { configure as serverlessExpress } from '@vendia/serverless-express';
import { Callback, Context, Handler } from 'aws-lambda';
import { MonoLambdaModule } from './mono-lambda.module';
import { CommonService, TransformInterceptor } from '@app/common';
import { ValidationPipe } from '@nestjs/common';
import {
  DocumentBuilder,
  SwaggerCustomOptions,
  SwaggerModule,
} from '@nestjs/swagger';

let server: Handler;

async function bootstrap(): Promise<Handler> {
  const app = await NestFactory.create(MonoLambdaModule);

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

  const document = SwaggerModule.createDocument(
    app,
    new DocumentBuilder()
      .setTitle('PLeon API')
      .setDescription('The API description')
      .setVersion('1.0')
      .addServer(process.env.HOST, 'server')
      .addServer('http://localhost:8000', 'local server')
      .addBearerAuth()
      .build(),
  );
  const swaggerCustomOptions: SwaggerCustomOptions = {
    swaggerOptions: {
      persistAuthorization: true,
    },
  };
  SwaggerModule.setup('api', app, document, swaggerCustomOptions);

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
