import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { MonolithicAppModule } from './monolithic-app.module';
import { TransformInterceptor } from '@app/common';
import { Cause, PlantCause, PlantSymptom, SpeciesService, Symptom } from '@app/plant';
import * as fs from 'fs/promises';
import {
  DocumentBuilder,
  SwaggerCustomOptions,
  SwaggerModule,
} from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { DiagnosisService } from '@app/plant/services/diagnosis.service';

async function bootstrap() {
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

  const document = SwaggerModule.createDocument(
    app,
    new DocumentBuilder()
      .setTitle('PLeon API')
      .setDescription('The API description')
      .setVersion('1.0')
      .addServer(process.env.TEST_HOST, 'test and dev server')
      .addServer('http://localhost:8000', 'local server')
      .addServer(process.env.HOST, 'production server')
      .addBearerAuth()
      .build(),
    {
      extraModels: [Symptom, Cause]
    }
  );
  const swaggerCustomOptions: SwaggerCustomOptions = {
    swaggerOptions: {
      persistAuthorization: true,
    },
  };
  SwaggerModule.setup('api', app, document, swaggerCustomOptions);

  const configService = app.get(ConfigService);
  await app.listen(configService.get<string>('PORT'));

  const speciesData = await fs.readFile(
    'apps/monolithic-app/src/species.json',
    {
      encoding: 'utf-8',
    },
  );
  const species = JSON.parse(speciesData);

  species.sort((a, b) => {
    let aName = a.scientific_name.toUpperCase();
    let bName = b.scientific_name.toUpperCase();
    if (aName < bName) {
      return -1;
    }
    if (aName > bName) {
      return 1;
    }
    return 0;
  });

  species.forEach((data, index) => {
    data.class_label = index;
    data.proper_watering_other = 1000 * 60 * 60 * 24 * 5;
    data.proper_watering_winter = 1000 * 60 * 60 * 24 * 7;
  });

  const speciesJSON = JSON.stringify(species, null, '  ');
  await fs.writeFile('apps/monolithic-app/src/species.json', speciesJSON, {
    encoding: 'utf-8',
  });
  console.log(species.length);

  // const speciesService = app.get(SpeciesService);
  // await speciesService.deleteMany({});
  // for (const data of species) {
  //   const ret = await speciesService.create(data);
  //   console.log(ret);
  // }

  const diagnosisService = app.get(DiagnosisService);
  const ret = await diagnosisService.analysis([
    [3, 4],
    [0, 5],
  ]);
  console.log(ret);
}
bootstrap();
