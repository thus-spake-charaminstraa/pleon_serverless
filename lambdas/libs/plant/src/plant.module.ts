import { Module } from '@nestjs/common';
import { PlantService } from './plant.service';
import { PlantRepository } from './plant.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { Plant, PlantSchema } from './entities/plant.entity';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Plant.name, schema: PlantSchema }]),
  ],
  providers: [PlantService, PlantRepository],
  exports: [PlantService, PlantRepository],
})
export class PlantModule {}
