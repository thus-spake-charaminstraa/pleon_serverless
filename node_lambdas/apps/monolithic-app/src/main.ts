import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { MonolithicAppModule } from './monolithic-app.module';
import {
  DocumentBuilder,
  SwaggerCustomOptions,
  SwaggerModule,
} from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { CauseRes, SymptomRes } from './inference.controller';
import { Diagnosis } from '@app/plant/entities/diagnosis.entity';
import { TransformInterceptor } from '@app/common/interceptors/transform.interceptor';
import { NotiRes } from '@app/noti/dto/noti.dto';
import cookieParser from 'cookie-parser';
import { NotiModal } from '@app/noti/resources/noti-modal';

async function bootstrap() {
  const start = Date.now();
  const app = await NestFactory.create(MonolithicAppModule, {
    logger: ['error', 'warn', 'debug', 'log', 'verbose'],
  });

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

  // use cookie
  app.use(cookieParser());

  const document = SwaggerModule.createDocument(
    app,
    new DocumentBuilder()
      .setTitle('PLeon API')
      .setDescription('The API description')
      .setVersion('1.0')
      .addServer(process.env.DEV_HOST, 'dev server')
      .addServer(process.env.TEST_HOST, 'test server')
      .addServer('http://localhost:8000', 'local server')
      .addServer(process.env.HOST, 'production server')
      .addBearerAuth()
      .build(),
    {
      extraModels: [SymptomRes, CauseRes, Diagnosis, NotiRes, NotiModal],
    },
  );
  const swaggerCustomOptions: SwaggerCustomOptions = {
    swaggerOptions: {
      persistAuthorization: true,
    },
  };
  SwaggerModule.setup('api', app, document, swaggerCustomOptions);

  const configService = app.get(ConfigService);
  await app.listen(configService.get<string>('PORT'));

  console.log('bootstrap time: ', Date.now() - start, 'ms');
}
bootstrap();
