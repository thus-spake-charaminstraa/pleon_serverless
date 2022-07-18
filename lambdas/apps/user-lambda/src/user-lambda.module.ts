import { AuthModule } from '@app/auth/auth.module';
import { AllExceptionsFilter } from '@app/common';
import { UserModule } from '@app/user/user.module';
import { Module, forwardRef } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import { MongooseModule } from '@nestjs/mongoose';
import { UserLambdaController } from './user-lambda.controller';

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
    forwardRef(() => AuthModule),
    forwardRef(() => UserModule),
  ],
  controllers: [UserLambdaController],
  providers: [
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
  ],
})
export class UserLambdaModule {}
