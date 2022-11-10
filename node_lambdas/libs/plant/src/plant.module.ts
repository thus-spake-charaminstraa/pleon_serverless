import { FeedModule } from '@app/feed/feed.module';
import { NotiModule } from '@app/noti/noti.module';
import {
  DeviceToken,
  DeviceTokenSchema,
} from '@app/user/entities/device-token.entity';
import { Module, forwardRef } from '@nestjs/common';
import { getConnectionToken, MongooseModule } from '@nestjs/mongoose';
import { PlantRepository } from './repositories/plant.repository';
import { SpeciesRepository } from './repositories/species.repository';
import { PlantService } from './services/plant.service';
import { SpeciesService } from './services/species.service';
import { DiagnosisService } from './services/diagnosis.service';
import { DiagnosisRepository } from './repositories/diagnosis.repository';
import { Diagnosis, DiagnosisSchema } from './entities/diagnosis.entity';
import { CommentModule } from '@app/comment/comment.module';
import { GuideService } from './services/guide.service';
import { Plant, PlantSchema } from './entities/plant.entity';
import { Species, SpeciesSchema } from './entities/species.entity';
import { User, UserSchema } from '@app/user/entities/user.entity';
import { Schema, Connection } from 'mongoose';

@Module({
  imports: [
    forwardRef(() =>
      MongooseModule.forFeatureAsync([
        {
          name: Plant.name,
          imports: [PlantModule, FeedModule, NotiModule, CommentModule],
          useFactory: async (
            conn: Connection,
            diagnosisSchema: Schema,
            feedSchema: Schema,
            notiSchema: Schema,
            commentSchema: Schema,
          ) => {
            const schema = PlantSchema;
            const diagnosisModel = conn.model('Diagnosis', diagnosisSchema);
            const feedModel = conn.model('Feed', feedSchema);
            const notiModel = conn.model('Noti', notiSchema);
            const commentModel = conn.model('Comment', commentSchema);
            schema.pre(
              'findOneAndDelete',
              { document: false, query: true },
              async function () {
                const { id } = this.getFilter();
                const ret = await Promise.all([
                  diagnosisModel.deleteMany({ plant_id: id }),
                  feedModel.deleteMany({ plant_id: id }),
                  notiModel.deleteMany({ plant_id: id }),
                  commentModel.deleteMany({ plant_id: id }),
                ]);
                console.log('plant cascade delete', ret);
              },
            );
            return schema;
          },
          inject: [
            getConnectionToken(),
            'DIAGNOSIS_SCHEMA',
            'FEED_SCHEMA',
            'NOTI_SCHEMA',
            'COMMENT_SCHEMA',
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
    {
      provide: 'DIAGNOSIS_SCHEMA',
      useValue: DiagnosisSchema,
    },
  ],
  exports: [
    PlantService,
    PlantRepository,
    SpeciesService,
    SpeciesRepository,
    DiagnosisService,
    DiagnosisRepository,
    GuideService,
    {
      provide: 'DIAGNOSIS_SCHEMA',
      useValue: DiagnosisSchema,
    },
  ],
})
export class PlantModule {}
