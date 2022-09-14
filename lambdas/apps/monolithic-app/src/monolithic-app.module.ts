import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import { MongooseModule } from '@nestjs/mongoose';
import { AllExceptionsFilter, CommonModule } from '@app/common';
import { UserModule } from '@app/user/user.module';
import { UserLambdaController } from '../../mono-app/src/user-lambda.controller';
import { AuthModule } from '@app/auth/auth.module';
import { AuthLambdaController } from '../../mono-app/src/auth-lambda.controller';
import { PlantModule } from '@app/plant/plant.module';
import { PlantLambdaController } from '../../mono-app/src/plant-lambda.controller';
import { ScheduleModule } from '@app/schedule/schedule.module';
import { ScheduleLambdaController } from '../../mono-app/src/schedule-lambda.controller';
import { ImageLambdaController } from '../../mono-app/src/image-lambda.controller';
import { ImageModule } from '@app/image';
import { FeedModule } from '@app/feed';
import { FeedLambdaController } from '../../mono-app/src/feed-lambda.controller';
import { NotiModule } from '@app/noti';
import { NotiLambdaController } from 'apps/mono-app/src/noti-lambda.controller';
import { GuideNotiController } from './guide-noti.controller';
import { CommentLambdaController } from 'apps/mono-app/src/comment-lambda.controller';
import { CommentModule } from '@app/comment';

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
export class MonolithicAppModule {}
