import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePlantDto, GetPlantQuery, UpdatePlantDto } from './dto/plant.dto';
import { Plant } from './entities/plant.entity';
import { PlantRepository } from './plant.repository';

@Injectable()
export class PlantService {
  constructor(private readonly plantRepository: PlantRepository) {}

  async create(createPlantDto: CreatePlantDto): Promise<Plant> {
    return await this.plantRepository.create(createPlantDto);
  }

  async findAll(query: GetPlantQuery): Promise<Plant[]> {
    return await this.plantRepository.findAll(query);
  }

  async findOne(id: string): Promise<Plant> {
    const plant = await this.plantRepository.findOne(id);
    if (!plant) {
      throw new NotFoundException('존재하지 않는 식물입니다.');
    }
    return plant;
  }

  async update(id: string, updatePlantDto: UpdatePlantDto): Promise<Plant> {
    const plant = await this.plantRepository.update(id, updatePlantDto);
    if (!plant) {
      throw new NotFoundException('존재하지 않는 식물입니다.');
    }
    return await this.plantRepository.update(id, updatePlantDto);
  }

  async deleteOne(id: string): Promise<void> {
    const ret = await this.plantRepository.deleteOne(id);
    if (!ret) {
      throw new NotFoundException('존재하지 않는 식물입니다.');
    }
  }
}
