import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import { MongooseModule } from '@nestjs/mongoose';
import { CommonModule } from '@app/common/common.module';
import { UserModule } from '@app/user/user.module';
import { UserLambdaController } from '../../monolithic-app/src/user-lambda.controller';
import { AuthModule } from '@app/auth/auth.module';
import { AuthLambdaController } from '../../monolithic-app/src/auth-lambda.controller';
import { PlantModule } from '@app/plant/plant.module';
import { PlantLambdaController } from '../../monolithic-app/src/plant-lambda.controller';
import { ScheduleModule } from '@app/schedule/schedule.module';
import { ScheduleLambdaController } from '../../monolithic-app/src/schedule-lambda.controller';
import { ImageModule } from '@app/image/image.module';
import { ImageLambdaController } from '../../monolithic-app/src/image-lambda.controller';
import { FeedLambdaController } from '../../monolithic-app/src/feed-lambda.controller';
import { FeedModule } from '@app/feed/feed.module';
import { NotiModule } from '@app/noti/noti.module';
import { NotiLambdaController } from '../../monolithic-app/src/noti-lambda.controller';
import { CommentLambdaController } from '../../monolithic-app/src/comment-lambda.controller';
import { CommentModule } from '@app/comment/comment.module';
import { AllExceptionsFilter } from '@app/common/filters/all-exceptions.filter';

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
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
  ],
})
export class MonoAppModule {}
