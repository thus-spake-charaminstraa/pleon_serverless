import { AuthModule } from '@app/auth/auth.module';
import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './entities/user.entity';
import { UserRepository } from './repositories/user.repository';
import { UserService } from './services/user.service';
import { DeviceTokenService } from './services/device-token.service';
import { DeviceTokenRepository } from './repositories/device-token.repository';
import { DeviceToken, DeviceTokenSchema } from './entities/device-token.entity';

@Module({
  imports: [
    forwardRef(() => AuthModule),
    MongooseModule.forFeature([
      {
        name: User.name,
        schema: UserSchema,
      },
      {
        name: DeviceToken.name,
        schema: DeviceTokenSchema,
      },
    ]),
  ],
  providers: [
    UserService,
    UserRepository,
    DeviceTokenService,
    DeviceTokenRepository,
    {
      provide: 'USER_SCHEMA',
      useValue: UserSchema,
    },
  ],
  exports: [
    UserService,
    UserRepository,
    DeviceTokenService,
    DeviceTokenRepository,
    {
      provide: 'USER_SCHEMA',
      useValue: UserSchema,
    },
  ],
})
export class UserModule {}
