import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import { MongooseModule } from '@nestjs/mongoose';
import { AllExceptionsFilter, CommonModule } from '@app/common';
import { UserModule } from '@app/user/user.module';
import { UserLambdaController } from './user-lambda.controller';
import { AuthModule } from '@app/auth/auth.module';
import { AuthLambdaController } from './auth-lambda.controller';
import { PlantModule } from '@app/plant/plant.module';
import { PlantLambdaController } from './plant-lambda.controller';
import { GuideNotiController } from './guide-noti.controller';
import { ScheduleModule } from '@app/schedule/schedule.module';
import { ScheduleLambdaController } from './schedule-lambda.controller';

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
  ],
  controllers: [
    UserLambdaController,
    AuthLambdaController,
    PlantLambdaController,
    ScheduleLambdaController,
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
