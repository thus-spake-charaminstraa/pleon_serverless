import { FeedModule } from '@app/feed/feed.module';
import { PlantModule } from '@app/plant/plant.module';
import { ScheduleModule } from '@app/schedule/schedule.module';
import { UserModule } from '@app/user/user.module';
import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Noti, NotiSchema } from './entities';
import { NotiRepository } from './noti.repository';
import { NotiService } from './noti.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Noti.name, schema: NotiSchema }]),
    forwardRef(() => ScheduleModule),
    forwardRef(() => PlantModule),
    UserModule,
    forwardRef(() => FeedModule),
  ],
  providers: [NotiService, NotiRepository],
  exports: [NotiService, NotiRepository],
})
export class NotiModule {}
