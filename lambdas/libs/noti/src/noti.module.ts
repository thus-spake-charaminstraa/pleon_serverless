import { Module } from '@nestjs/common';
import { NotiService } from './noti.service';
import { NotiRepository } from './noti.repository';
import { ScheduleModule } from '@app/schedule';
import { MongooseModule } from '@nestjs/mongoose';
import { NotiSchema } from './entities/noti.entity';
import { PlantModule } from '@app/plant';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Noti', schema: NotiSchema }]),
    ScheduleModule,
    PlantModule,
  ],
  providers: [NotiService, NotiRepository],
  exports: [NotiService, NotiRepository],
})
export class NotiModule {}
