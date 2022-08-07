import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import { MongooseModule } from '@nestjs/mongoose';
import { AllExceptionsFilter, CommonModule } from '@app/common';
import { UserModule } from '@app/user/user.module';
import { UserLambdaController } from '../../mono-lambda/src/user-lambda.controller';
import { AuthModule } from '@app/auth/auth.module';
import { AuthLambdaController } from '../../mono-lambda/src/auth-lambda.controller';
import { PlantModule } from '@app/plant/plant.module';
import { PlantLambdaController } from '../../mono-lambda/src/plant-lambda.controller';
import { ScheduleModule } from '@app/schedule/schedule.module';
import { ScheduleLambdaController } from '../../mono-lambda/src/schedule-lambda.controller';
import { ImageLambdaController } from '../../mono-lambda/src/image-lambda.controller';
import { ImageModule } from '@app/image';
import { FeedModule } from '@app/feed';
import { FeedLambdaController } from '../../mono-lambda/src/feed-lambda.controller';
import { NotiModule } from '@app/noti';
import { NotiLambdaController } from 'apps/mono-lambda/src/noti-lambda.controller';
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
  ],
  controllers: [
    UserLambdaController,
    AuthLambdaController,
    PlantLambdaController,
    ImageLambdaController,
    FeedLambdaController,
    ScheduleLambdaController,
    NotiLambdaController,
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
