import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { MonolithicAppModule } from './monolithic-app.module';
import util from 'util';
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
import { FeedService } from '@app/feed/feed.service';
import { Diagnosis } from '@app/plant/entities/diagnosis.entity';
import { PlantRepository } from '@app/plant/repositories/plant.repository';
import { TransformInterceptor } from '@app/common/interceptors/transform.interceptor';
import { GuideService } from '@app/plant/services/guide.service';
import { GetFeedOrderBy } from '@app/feed/dto/feed.dto';
import { Types } from 'mongoose';
import { CommentService } from '@app/comment/comment.service';
import { FeedRes } from '@app/feed/dto/feed-success-response.dto';
import { CommentAuthorKind } from '@app/comment/types/comment-author-kind.type';
import { FeedKind } from '@app/feed/types/feed-kind.type';
import { DeviceTokenService } from '@app/user/services/device-token.service';
import { NotiService } from '@app/noti/noti.service';
import { NotiKind } from '@app/noti/types/noti-kind.type';
import { NotiRes } from '@app/noti/dto/noti.dto';

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
      .addServer(process.env.DEV_HOST, 'dev server')
      .addServer(process.env.TEST_HOST, 'test server')
      .addServer('http://localhost:8000', 'local server')
      .addServer(process.env.HOST, 'production server')
      .addBearerAuth()
      .build(),
    {
      extraModels: [SymptomRes, CauseRes, Diagnosis, NotiRes],
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

  const feedService = app.get(FeedService);
  const commentService = app.get(CommentService);
  const deviceTokenService = app.get(DeviceTokenService);
  const notiService = app.get(NotiService);

  // await notiService.deleteMany({ kind: NotiKind.comment });

  // const feedlist = await feedService.findAll({
  //   owner: new Types.ObjectId('62c3dd65ff76f24d880331a9'),
  //   limit: 1000000,
  //   order_by: GetFeedOrderBy.DESC,
  //   offset: 0,
  //   start: new Date('2022-09-01'),
  //   end: new Date('2022-09-30'),
  // });
  // console.log(feedlist);
  // await Promise.all(
  //   feedlist.map((feed: any) => {
  //     return Promise.all(
  //       feed.comments.map((comment: any) => {
  //         return commentService.deleteOne(comment.id);
  //       }),
  //     );
  //   }),
  // );

  // const feeds = await feedService.findAllNotCommented({
  //   owner: new Types.ObjectId('62c3dd65ff76f24d880331a9'),
  //   start: new Date('2022-09-01'),
  //   end: new Date('2022-09-30'),
  // });
  // console.log(feeds);
  // const comments = await Promise.all(feeds.map((feed: FeedRes) => {
  //   let content = '댓글입니다.';
  //   switch (feed.kind) {
  //     case FeedKind.water:
  //       content = '와 물이 너무 시원해요~';
  //       break;
  //     case FeedKind.spray:
  //       content = '잎이 촉촉해졌어요.';
  //       break;
  //     case FeedKind.air:
  //       content = '바깥 공기가 상쾌해요.';
  //       break;
  //     case FeedKind.nutrition:
  //       content = '집이 풍족해졌어요!';
  //       break;
  //     case FeedKind.repot:
  //       content = '집이 새로워졌어요!';
  //       break;
  //     case FeedKind.prune:
  //       content = '새로 단장하니 기분이 좋아요!';
  //       break;
  //     default:
  //       content = '';
  //       break;
  //   }
  //   if (content != '') {
  //     return commentService.create({
  //       feed_id: feed.id.toString(),
  //       plant_id: feed.plant_id.toString(),
  //       author_kind: CommentAuthorKind.plant,
  //       content,
  //     });
  //   }
  //   return Promise.resolve();
  // }))
  // console.log(comments);
}
bootstrap();
