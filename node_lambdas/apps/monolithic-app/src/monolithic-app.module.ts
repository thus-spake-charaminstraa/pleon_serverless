import { AuthModule } from '@app/auth/auth.module';
import { CommentModule } from '@app/comment/comment.module';
import { AllExceptionsFilter } from '@app/common/filters/all-exceptions.filter';
import { CommonModule } from '@app/common/common.module';
import { FeedModule } from '@app/feed/feed.module';
import { ImageModule } from '@app/image/image.module';
import { NotiModule } from '@app/noti/noti.module';
import { PlantModule } from '@app/plant/plant.module';
import { ScheduleModule } from '@app/schedule/schedule.module';
import { UserModule } from '@app/user/user.module';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthLambdaController } from 'apps/mono-app/src/auth-lambda.controller';
import { CommentLambdaController } from 'apps/mono-app/src/comment-lambda.controller';
import { FeedLambdaController } from 'apps/mono-app/src/feed-lambda.controller';
import { ImageLambdaController } from 'apps/mono-app/src/image-lambda.controller';
import { NotiLambdaController } from 'apps/mono-app/src/noti-lambda.controller';
import { PlantLambdaController } from 'apps/mono-app/src/plant-lambda.controller';
import { ScheduleLambdaController } from 'apps/mono-app/src/schedule-lambda.controller';
import { UserLambdaController } from 'apps/mono-app/src/user-lambda.controller';
import { GuideNotiController } from './guide-noti.controller';
import { InferenceController } from './inference.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env.dev',
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('DATABASE_URI'),
      }),
      inject: [ConfigService],
    }),
    CommonModule,
    AuthModule,
    UserModule,
    PlantModule,
    ScheduleModule,
    ImageModule,
    FeedModule,
    NotiModule,
    CommentModule,
  ],
  controllers: [
    UserLambdaController,
    AuthLambdaController,
    PlantLambdaController,
    ImageLambdaController,
    FeedLambdaController,
    ScheduleLambdaController,
    NotiLambdaController,
    CommentLambdaController,
    GuideNotiController,
    InferenceController,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
  ],
})
export class MonolithicAppModule {}
