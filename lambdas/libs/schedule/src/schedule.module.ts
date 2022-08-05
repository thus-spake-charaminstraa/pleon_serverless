import { PlantModule } from '@app/plant';
import { Module, forwardRef } from '@nestjs/common';
import { ScheduleService } from './schedule.service';
import { ScheduleRepository } from './schedule.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { Schedule, ScheduleSchema } from './entities/schedule.entity';

@Module({
  imports: [
    forwardRef(() => PlantModule),
    MongooseModule.forFeature([
      { name: Schedule.name, schema: ScheduleSchema },
    ]),
  ],
  providers: [ScheduleService, ScheduleRepository],
  exports: [ScheduleService, ScheduleRepository],
})
export class ScheduleModule {}
