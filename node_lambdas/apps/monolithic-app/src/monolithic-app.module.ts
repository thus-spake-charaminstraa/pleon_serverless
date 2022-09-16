import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import { MongooseModule } from '@nestjs/mongoose';
import { AllExceptionsFilter, CommonModule } from '@app/common';
import { AuthModule } from '@app/auth/auth.module';
import { UserModule } from '@app/user/user.module';
import { PlantModule } from '@app/plant';
import { ScheduleModule } from '@app/schedule';
import { ImageModule } from '@app/image';
import { FeedModule } from '@app/feed';
import { NotiModule } from '@app/noti';
import { CommentModule } from '@app/comment';
import { UserLambdaController } from './user-lambda.controller';
import { AuthLambdaController } from './auth-lambda.controller';
import { PlantLambdaController } from './plant-lambda.controller';
import { FeedLambdaController } from './feed-lambda.controller';
import { ScheduleLambdaController } from './schedule-lambda.controller';
import { NotiLambdaController } from './noti-lambda.controller';
import { CommentLambdaController } from './comment-lambda.controller';
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
    UserLambdaController,
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
