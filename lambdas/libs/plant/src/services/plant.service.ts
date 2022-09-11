import { Injectable } from '@nestjs/common';
import {
  CreatePlantDto,
  GetPlantQuery,
  UpdatePlantDto,
} from '../dto/plant.dto';
import { Plant } from '../entities/plant.entity';
import { PlantRepository } from '../repositories/plant.repository';
import { CommonService } from '@app/common';

@Injectable()
export class PlantService extends CommonService<
  Plant,
  CreatePlantDto,
  UpdatePlantDto,
  GetPlantQuery
> {
  constructor(private plantRepository: PlantRepository) {
    super(plantRepository);
  }
}
