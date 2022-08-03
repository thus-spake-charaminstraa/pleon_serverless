import { Injectable, NotFoundException } from '@nestjs/common';
import { ScheduleRepository } from './schedule.repository';
import { PlantRepository } from '@app/plant';
import { plantInfoForGuide, ScheduleKind } from '@app/common/types';
import { CreateScheduleDto, GetScheduleQuery } from './dto/schedule.dto';
import { Schedule } from './entities/schedule.entity';

@Injectable()
export class ScheduleService {
  constructor(
    private readonly plantRepository: PlantRepository,
    private readonly scheduleRepository: ScheduleRepository,
  ) {}

  async getAllPlantInfo(): Promise<plantInfoForGuide[]> {
    return await this.plantRepository.findAllInfo();
  }

  getPlantGuide(species: string): any {
    return {
      WATER: new Date(60 * 60 * 1000),
      AIR: new Date(60 * 60 * 1000),
      REPOT: new Date(60 * 60 * 1000),
      PRUNE: new Date(60 * 60 * 1000),
      SPRAY: new Date(60 * 60 * 1000),
      FERTILIZE: new Date(60 * 60 * 1000),
    };
  }

  async checkScheduleOverdue(plantInfo: plantInfoForGuide): Promise<any> {
    const scheduleOfPlantByKind =
      await this.scheduleRepository.findByPlantAndGroup(
        plantInfo.id.toString(),
      );
    const guide = this.getPlantGuide(plantInfo.species);
    let ret = {};
    for (let kind of Object.keys(ScheduleKind)) {
      let overdue = false;
      const schedule = scheduleOfPlantByKind[kind];
      if (schedule.length > 0) {
        if (schedule[0].timestamp.getTime() + guide[kind].getTime() <= Date.now()) {
          overdue = true;
        }
      }
      ret[kind] = overdue;
    }
    return ret;
  }

  async create(createScheduleDto: CreateScheduleDto): Promise<Schedule> {
    const plant = await this.plantRepository.findOne(
      createScheduleDto.plant_id,
    );
    if (!plant) {
      throw new NotFoundException('plant not found');
    }
    return await this.scheduleRepository.create(createScheduleDto);
  }

  async findAll(query: GetScheduleQuery): Promise<Schedule[]> {
    return await this.scheduleRepository.findAll(query);
  }

  async deleteOne(id: string): Promise<void> {
    await this.scheduleRepository.deleteOne(id);
  }
}
