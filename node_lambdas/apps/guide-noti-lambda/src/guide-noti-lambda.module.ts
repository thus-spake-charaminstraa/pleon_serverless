import { NotiModule } from '@app/noti';
import { PlantModule } from '@app/plant';
import { ScheduleModule } from '@app/schedule';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

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
    PlantModule,
    ScheduleModule,
    NotiModule,
  ],
})
export class GuideNotiLambdaModule {}
