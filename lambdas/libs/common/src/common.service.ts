import { Injectable, ValidationPipe, INestApplication } from '@nestjs/common';
import {
  DocumentBuilder,
  SwaggerCustomOptions,
  SwaggerModule,
} from '@nestjs/swagger';
import { TransformInterceptor } from './interceptors';

@Injectable()
export class CommonService {
  static prepareNestApp(app: INestApplication) {
    app.enableCors({
      origin: '*',
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
      preflightContinue: false,
      optionsSuccessStatus: 204,
    });
    
    // use validation pipe
    app.useGlobalPipes(new ValidationPipe());

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
  }
}
