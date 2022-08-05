import { Module, forwardRef } from '@nestjs/common';
import { PlantService } from './plant.service';
import { PlantRepository } from './plant.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { Plant, PlantSchema } from './entities/plant.entity';
import { FeedModule, FeedRepository } from '@app/feed';

@Module({
  imports: [
    MongooseModule.forFeatureAsync([
      {
        name: Plant.name,
        imports: [FeedModule],
        useFactory: (feedRepository: FeedRepository) => {
          const schema = PlantSchema;
          schema.pre(
            'findOneAndDelete',
            { document: false, query: true },
            async function () {
              const { id } = this.getFilter();
              await feedRepository.deleteAll({ plant_id: id });
            },
          );
          return schema;
        },
        inject: [FeedRepository],
      },
    ]),
  ],
  providers: [PlantService, PlantRepository],
  exports: [PlantService, PlantRepository],
})
export class PlantModule {}
