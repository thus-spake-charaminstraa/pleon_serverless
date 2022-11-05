import { CacheModule, forwardRef, Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserModule } from '@app/user/user.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthRepository } from './auth.repository';
import {
  JwtCheckStrategy,
  JwtStrategy,
  RefreshJwtStrategy,
} from './strategies/jwt.strategy';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    forwardRef(() => UserModule),
    PassportModule,
    JwtModule.registerAsync({
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: parseInt(config.get<string>('JWT_EXPIRES_IN')),
        },
      }),
      inject: [ConfigService],
    }),
    CacheModule.register(),
    HttpModule,
  ],
  providers: [
    AuthService,
    AuthRepository,
    JwtStrategy,
    JwtCheckStrategy,
    RefreshJwtStrategy,
  ],
  exports: [AuthService, AuthRepository],
})
export class AuthModule {}
