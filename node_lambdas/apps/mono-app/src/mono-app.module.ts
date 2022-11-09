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
import { AuthLambdaController } from './auth-lambda.controller';
import { CommentLambdaController } from './comment-lambda.controller';
import { FeedLambdaController } from './feed-lambda.controller';
import { ImageLambdaController } from './image-lambda.controller';
import { NotiLambdaController } from './noti-lambda.controller';
import { PlantLambdaController } from './plant-lambda.controller';
import { ScheduleLambdaController } from './schedule-lambda.controller';
import { UserLambdaController } from './user-lambda.controller';
import { GuideNotiController } from './guide-noti.controller';

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
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
  ],
})
export class MonoAppModule {}
