import { FeedModule } from '@app/feed/feed.module';
import { FeedRepository } from '@app/feed/feed.repository';
import { NotiModule } from '@app/noti/noti.module';
import { NotiRepository } from '@app/noti/noti.repository';
import { ScheduleModule } from '@app/schedule/schedule.module';
import { ScheduleRepository } from '@app/schedule/schedule.repository';
import { DeviceToken, DeviceTokenSchema, User, UserSchema } from '@app/user';
import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Plant, PlantSchema, Species, SpeciesSchema } from './entities';
import { PlantRepository } from './repositories/plant.repository';
import { SpeciesRepository } from './repositories/species.repository';
import { PlantService } from './services/plant.service';
import { SpeciesService } from './services/species.service';
import { DiagnosisService } from './services/diagnosis.service';
import { DiagnosisRepository } from './repositories/diagnosis.repository';
import { Diagnosis, DiagnosisSchema } from './entities/diagnosis.entity';

@Module({
  imports: [
    forwardRef(() =>
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
          useFactory: () => SpeciesSchema,
        },
        {
          name: Diagnosis.name,
          useFactory: () => DiagnosisSchema,
        },
        {
          name: User.name,
          useFactory: () => UserSchema,
        },
        {
          name: DeviceToken.name,
          useFactory: () => DeviceTokenSchema,
        },
      ]),
    ),
    forwardRef(() => FeedModule),
    forwardRef(() => NotiModule),
  ],
  providers: [
    PlantService,
    PlantRepository,
    SpeciesService,
    SpeciesRepository,
    DiagnosisService,
    DiagnosisRepository,
  ],
  exports: [
    PlantService,
    PlantRepository,
    SpeciesService,
    SpeciesRepository,
    DiagnosisService,
    DiagnosisRepository,
  ],
})
export class PlantModule {}
