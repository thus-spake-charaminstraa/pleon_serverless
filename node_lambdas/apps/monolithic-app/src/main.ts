import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { MonolithicAppModule } from './monolithic-app.module';
import { CommonService, TransformInterceptor } from '@app/common';
import { CreateSpeciesDto, PlantService } from '@app/plant';
import * as fs from 'fs/promises';
import { PlantDifficulty, PlantHumidity, PlantLight } from '@app/plant/types';
import { ScheduleService } from '@app/schedule';
import {
  DocumentBuilder,
  SwaggerCustomOptions,
  SwaggerModule,
} from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

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
      .addServer(process.env.TEST_HOST, 'test server')
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

  const configService = app.get(ConfigService);
  await app.listen(configService.get<string>('PORT'));

  const plantService = app.get(PlantService);
  const speciesData = await fs.readFile('apps/monolithic-app/src/species.csv', {
    encoding: 'utf-8',
  });

  const legends = [
    'name',
    'scientific_name',
    'english_name',
    'plant_feature',
    'water_description',
    'managing_point',
    'species_family',
    'proper_temperature',
    'proper_light',
    'proper_humidity',
    'benefit',
    'blight',
    'managing_difficulty',
    'poison',
    'tip',
  ];
  const species = [];
  CSVToArray(speciesData)
    .slice(1)
    .forEach((data, index1) => {
      species.push({});
      data.forEach((value, index2) => {
        if (legends[index2]) {
          species[index1][legends[index2]] = value;
        }
      });
    });

  species.forEach((data, index) => {
    const ret = [];
    if (data.proper_light.match(new RegExp(/(\P{L}|^)양지(\P{L}|$)/gu))) {
      ret.push(PlantLight.bright);
    }
    if (data.proper_light.match(new RegExp(/(\P{L}|^)반양지(\P{L}|$)/gu))) {
      ret.push(PlantLight.half_bright);
    }
    if (data.proper_light.match(new RegExp(/(\P{L}|^)반음지(\P{L}|$)/gu))) {
      ret.push(PlantLight.dark);
    }
    data.proper_light = ret;
  });

  species.forEach((data, index) => {
    const ret = [];
    if (data.proper_humidity.match(new RegExp(/보통/gu))) {
      ret.push(PlantHumidity.normal);
    }
    if (data.proper_humidity.match(new RegExp(/높/gu))) {
      ret.push(PlantHumidity.high);
    }
    if (data.proper_humidity.match(new RegExp(/낮/gu))) {
      ret.push(PlantHumidity.low);
    }
    data.proper_humidity = ret;
  });

  species.forEach((data, index) => {
    let ret;
    if (data.managing_difficulty.match(new RegExp(/중/gu))) {
      ret = PlantDifficulty.normal;
    }
    if (data.managing_difficulty.match(new RegExp(/하/gu))) {
      ret = PlantDifficulty.easy;
    }
    if (data.managing_difficulty.match(new RegExp(/상/gu))) {
      ret = PlantDifficulty.hard;
    }
    data.managing_difficulty = ret;
  });

  const speciesJSON = JSON.stringify(species, null, '  ');
  await fs.writeFile('apps/monolithic-app/src/species.json', speciesJSON, {
    encoding: 'utf-8',
  });
  console.log(species.length);
  // for (const data of species) {
  //   console.log(data);
  //   await plantService.createSpecies(data);
  // }

  const scheduleService = app.get(ScheduleService);
  const schedules = await scheduleService.findAll({});
}
bootstrap();

function CSVToArray(strData, strDelimiter?) {
  // Check to see if the delimiter is defined. If not,
  // then default to comma.
  strDelimiter = strDelimiter || ',';

  // Create a regular expression to parse the CSV values.
  const objPattern = new RegExp(
    // Delimiters.
    '(\\' +
      strDelimiter +
      '|\\r?\\n|\\r|^)' +
      // Quoted fields.
      '(?:"([^"]*(?:""[^"]*)*)"|' +
      // Standard fields.
      '([^"\\' +
      strDelimiter +
      '\\r\\n]*))',
    'gi',
  );

  // Create an array to hold our data. Give the array
  // a default empty first row.
  const arrData = [[]];

  // Create an array to hold our individual pattern
  // matching groups.
  let arrMatches = null;

  // Keep looping over the regular expression matches
  // until we can no longer find a match.
  while ((arrMatches = objPattern.exec(strData))) {
    // Get the delimiter that was found.
    const strMatchedDelimiter = arrMatches[1];

    // Check to see if the given delimiter has a length
    // (is not the start of string) and if it matches
    // field delimiter. If id does not, then we know
    // that this delimiter is a row delimiter.
    if (strMatchedDelimiter.length && strMatchedDelimiter !== strDelimiter) {
      // Since we have reached a new row of data,
      // add an empty row to our data array.
      arrData.push([]);
    }

    var strMatchedValue;

    // Now that we have our delimiter out of the way,
    // let's check to see which kind of value we
    // captured (quoted or unquoted).
    if (arrMatches[2]) {
      // We found a quoted value. When we capture
      // this value, unescape any double quotes.
      strMatchedValue = arrMatches[2].replace(new RegExp('""', 'g'), '"');
    } else {
      // We found a non-quoted value.
      strMatchedValue = arrMatches[3];
    }

    // Now that we have our value string, let's add
    // it to the data array.
    arrData[arrData.length - 1].push(strMatchedValue);
  }

  // Return the parsed data.
  return arrData;
}
