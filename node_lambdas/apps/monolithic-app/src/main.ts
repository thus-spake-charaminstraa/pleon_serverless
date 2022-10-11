import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { MonolithicAppModule } from './monolithic-app.module';
import { TransformInterceptor } from '@app/common';

import * as fs from 'fs/promises';
import {
  DocumentBuilder,
  SwaggerCustomOptions,
  SwaggerModule,
} from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { DiagnosisService } from '@app/plant/services/diagnosis.service';
import { ImageService } from '@app/image/image.service';
import { CauseRes, SymptomRes } from './inference.controller';
import { Diagnosis } from '@app/plant';

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
      extraModels: [SymptomRes, CauseRes, Diagnosis],
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

  // const diagnosisService = app.get(DiagnosisService);
  // const imageService = app.get(ImageService);

  // const event = {
  //   body: '{"result":[[{"box":[64.62814331054688,77.23014831542969,533.0747680664062,765.0573120117188],"score":0.9524128437042236,"category":3,"image_url":"https://post-phinf.pstatic.net/MjAxODAxMTZfMTYw/MDAxNTE2MDkzNzEyMDg1.o6eKeZIgFOmSxe-3nHF9CdrAsZ5eaGm56TY78t_URWog.xbCTC-u3XdB3Su136i3RUOYrxdC8yw3F8M8XSo6C_v0g.JPEG/brown-leaf-edges1.jpg?type=w1200"},{"box":[1.9872417449951172,652.7341918945312,186.97508239746094,800],"score":0.8973885774612427,"category":0,"image_url":"https://post-phinf.pstatic.net/MjAxODAxMTZfMTYw/MDAxNTE2MDkzNzEyMDg1.o6eKeZIgFOmSxe-3nHF9CdrAsZ5eaGm56TY78t_URWog.xbCTC-u3XdB3Su136i3RUOYrxdC8yw3F8M8XSo6C_v0g.JPEG/brown-leaf-edges1.jpg?type=w1200"}],[]],"plant_id":"62fb4213d67227a47309226d"}',
  // };

  // const body = JSON.parse(event.body);
  // console.log(body);
  // const result: any[][] = body.result;
  // const plantSymptoms = result.filter((imageResult) => imageResult.length > 0);
  // const ret = await diagnosisService.analysis(plantSymptoms, body.plant_id);
  // // const imageBuffers = await Promise.all([
  // //   ...ret.symptoms.map((s: any) =>
  // //     imageService.downloadImageByUrl(s.image_url),
  // //   ),
  // // ]);
  // // const croppedImagesUrl = await Promise.all([
  // //   ...imageBuffers.map((imageBuffer, index) =>
  // //     imageService.cropImageByProportionBox(
  // //       imageBuffer,
  // //       ret.symptoms[index].box,
  // //     ),
  // //   ),
  // // ]);
  // // ret.symptoms.forEach((s: any, index: number) => {
  // //   s.image_url = croppedImagesUrl[index].url;
  // // });
  // console.log(ret);
}
bootstrap();
