import { Injectable, NotFoundException } from '@nestjs/common';
import { ScheduleRepository } from './schedule.repository';
import { PlantRepository } from '@app/plant';
import { plantInfoForGuide, ScheduleKind } from '@app/common/types';
import { SNSClient } from '@aws-sdk/client-sns';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { Schedule } from './entities/schedule.entity';

const snsClient = new SNSClient({ region: process.env.AWS_REGION });

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
      water: new Date(7 * 24 * 60 * 60 * 1000),
      air: new Date(3 * 24 * 60 * 60 * 1000),
      repot: new Date(180 * 24 * 60 * 60 * 1000),
      prune: new Date(21 * 24 * 60 * 60 * 1000),
      spray: new Date(4 * 24 * 60 * 60 * 1000),
      fertilize: new Date(31 * 24 * 60 * 60 * 1000),
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
      for (let schedule of scheduleOfPlantByKind[kind]) {
        if (schedule[0].timestamp + guide[kind] <= Date.now()) {
          overdue = true;
        }
      }
      ret[kind] = overdue;
    }
    return ret;
  }

  async sendNotiForPlant(plantInfo: plantInfoForGuide): Promise<void> {
    const overdue = await this.checkScheduleOverdue(plantInfo);
    if (overdue.water) {
      console.log('water');
      // aws sns publish
    }
  }

  async sendNotiForPlants(): Promise<void> {
    const plantInfos = await this.getAllPlantInfo();
    for (let plant of plantInfos) {
      await this.sendNotiForPlant(plant);
    }
  }

  async create(createScheduleDto: CreateScheduleDto): Promise<Schedule> {
    const plant = await this.plantRepository.findOne(createScheduleDto.plant_id);
    if (!plant) {
      throw new NotFoundException('plant not found');
    }
    return await this.scheduleRepository.create(createScheduleDto);
  }

  async findAll(): Promise<Schedule[]> {
    return await this.scheduleRepository.findAll();
  }

  async delete(id: string): Promise<void> {
    await this.scheduleRepository.remove(id);
  }
}
