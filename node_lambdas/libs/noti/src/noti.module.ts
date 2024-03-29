import { UserModule } from '@app/user/user.module';
import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Noti, NotiSchema } from './entities/noti.entity';
import { NotiRepository } from './noti.repository';
import { NotiService } from './noti.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Noti.name, schema: NotiSchema }]),
    forwardRef(() => UserModule),
  ],
  providers: [
    NotiService,
    NotiRepository,
    {
      provide: 'NOTI_SCHEMA',
      useValue: NotiSchema,
    },
  ],
  exports: [
    NotiService,
    NotiRepository,
    {
      provide: 'NOTI_SCHEMA',
      useValue: NotiSchema,
    },
  ],
})
export class NotiModule {}
