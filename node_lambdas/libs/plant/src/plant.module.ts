import { FeedModule } from '@app/feed/feed.module';
import { FeedRepository } from '@app/feed/feed.repository';
import { NotiModule } from '@app/noti/noti.module';
import { NotiRepository } from '@app/noti/noti.repository';
import {
  DeviceToken,
  DeviceTokenSchema,
} from '@app/user/entities/device-token.entity';
import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PlantRepository } from './repositories/plant.repository';
import { SpeciesRepository } from './repositories/species.repository';
import { PlantService } from './services/plant.service';
import { SpeciesService } from './services/species.service';
import { DiagnosisService } from './services/diagnosis.service';
import { DiagnosisRepository } from './repositories/diagnosis.repository';
import { Diagnosis, DiagnosisSchema } from './entities/diagnosis.entity';
import { CommentModule } from '@app/comment/comment.module';
import { CommentRepository } from '@app/comment/comment.repository';
import { GuideService } from './services/guide.service';
import { Plant, PlantSchema } from './entities/plant.entity';
import { Species, SpeciesSchema } from './entities/species.entity';
import { User, UserSchema } from '@app/user/entities/user.entity';

@Module({
  imports: [
    forwardRef(() =>
      MongooseModule.forFeatureAsync([
        {
          name: Plant.name,
          imports: [PlantModule, FeedModule, NotiModule, CommentModule],
          useFactory: async (
            feedRepository: FeedRepository,
            notiRepository: NotiRepository,
            diagnosisRepository: DiagnosisRepository,
            commentRepository: CommentRepository,
          ) => {
            const schema = PlantSchema;
            schema.pre(
              'findOneAndDelete',
              { document: false, query: true },
              async function () {
                const { id } = this.getFilter();
                await Promise.all([
                  feedRepository.deleteAll({ plant_id: id }),
                  notiRepository.deleteMany({ plant_id: id }),
                  diagnosisRepository.deleteMany({ plant_id: id }),
                  commentRepository.deleteMany({ plant_id: id }),
                ]);
              },
            );
            return schema;
          },
          inject: [
            FeedRepository,
            NotiRepository,
            DiagnosisRepository,
            CommentRepository,
          ],
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
    FeedModule,
    NotiModule,
  ],
  providers: [
    PlantService,
    PlantRepository,
    SpeciesService,
    SpeciesRepository,
    DiagnosisService,
    DiagnosisRepository,
    GuideService,
  ],
  exports: [
    PlantService,
    PlantRepository,
    SpeciesService,
    SpeciesRepository,
    DiagnosisService,
    DiagnosisRepository,
    GuideService,
  ],
})
export class PlantModule {}
