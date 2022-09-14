import { Module, forwardRef } from '@nestjs/common';
import { NotiService } from './noti.service';
import { NotiRepository } from './noti.repository';
import { ScheduleModule } from '@app/schedule';
import { MongooseModule } from '@nestjs/mongoose';
import { NotiSchema } from './entities/noti.entity';
import { PlantModule } from '@app/plant';
import { UserModule } from '@app/user/user.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Noti', schema: NotiSchema }]),
    forwardRef(() => ScheduleModule),
    forwardRef(() => PlantModule),
    UserModule,
  ],
  providers: [NotiService, NotiRepository],
  exports: [NotiService, NotiRepository],
})
export class NotiModule {}
