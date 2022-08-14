import { Module, forwardRef } from '@nestjs/common';
import { PlantService } from './plant.service';
import { PlantRepository } from './plant.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { Plant, PlantSchema } from './entities/plant.entity';
import { FeedModule, FeedRepository } from '@app/feed';
import { ScheduleModule, ScheduleRepository } from '@app/schedule';
import { NotiModule, NotiRepository } from '@app/noti';
import { Species, SpeciesSchema } from './entities/species.entity';

@Module({
  imports: [
    MongooseModule.forFeatureAsync([
      {
        name: Plant.name,
        imports: [FeedModule, ScheduleModule, NotiModule],
        useFactory: (
          feedRepository: FeedRepository,
          scheduleRepository: ScheduleRepository,
          notiRepository: NotiRepository,
        ) => {
          const schema = PlantSchema;
          schema.pre(
            'findOneAndDelete',
            { document: false, query: true },
            async function () {
              const { id } = this.getFilter();
              await Promise.all([
                feedRepository.deleteAll({ plant_id: id }),
                scheduleRepository.deleteAll({ plant_id: id }),
                notiRepository.deleteAll({ plant_id: id }),
              ]);
            },
          );
          return schema;
        },
        inject: [FeedRepository, ScheduleRepository, NotiRepository],
      },
      {
        name: Species.name,
        useFactory: () => (SpeciesSchema),
      }
    ]),
  ],
  providers: [PlantService, PlantRepository],
  exports: [PlantService, PlantRepository],
})
export class PlantModule {}
