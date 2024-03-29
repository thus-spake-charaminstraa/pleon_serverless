import {
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ScheduleRepository } from './schedule.repository';
import { PlantRepository } from '@app/plant/repositories/plant.repository';
import { plantInfoForGuide } from '@app/common/types/plant-guide.type';
import { CreateScheduleDto, GetScheduleQuery } from './dto/schedule.dto';
import { Schedule } from './entities/schedule.entity';
import { ScheduleKind } from './types/schedule-kind.enum';
import { ScheduleRes } from './dto/schedule-success-response.dto';

@Injectable()
export class ScheduleService {
  constructor(
    @Inject(forwardRef(() => PlantRepository))
    private readonly plantRepository: PlantRepository,
    private readonly scheduleRepository: ScheduleRepository,
  ) {}

  getPlantGuide(species: any): any {
    return {
      water: new Date(7 * 24 * 60 * 60 * 1000),
      air: new Date(2 * 24 * 60 * 60 * 1000),
      repot: new Date(90 * 24 * 60 * 60 * 1000),
      prune: new Date(30 * 24 * 60 * 60 * 1000),
      spray: new Date(3 * 24 * 60 * 60 * 1000),
      nutrition: new Date(30 * 24 * 60 * 60 * 1000),
    };
  }

  async checkScheduleOverdue(plantInfo: plantInfoForGuide): Promise<any> {
    const scheduleOfPlantByKind =
      await this.scheduleRepository.findByPlantAndGroup(
        plantInfo.id.toString(),
      );
    const guide = this.getPlantGuide(plantInfo.species);
    const ret = {};
    for (const kind of Object.keys(ScheduleKind)) {
      let overdue = false;
      const schedule = scheduleOfPlantByKind[kind];
      if (schedule.length > 0) {
        if (
          schedule[0].timestamp.getTime() + guide[kind].getTime() <=
          Date.now()
        ) {
          overdue = true;
        }
      }
      if (ret[kind] === ScheduleKind.air) overdue = true;

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

  async findAll(query: GetScheduleQuery): Promise<ScheduleRes[]> {
    return await this.scheduleRepository.findAll(query);
  }

  async findAllAndGroupBy(query: GetScheduleQuery): Promise<any> {
    const ret = await this.scheduleRepository.findAllAndGroupBy(query);
    ret.forEach((item) => {
      item.kinds = item.kinds.map((kind) =>
        kind == ScheduleKind.water
          ? 'water'
          : kind == ScheduleKind.air
          ? 'air'
          : kind == ScheduleKind.prune
          ? 'prune'
          : kind == ScheduleKind.spray
          ? 'spray'
          : kind == ScheduleKind.nutrition
          ? 'nutrition'
          : 'etc',
      );
    });
    return ret;
  }

  async deleteOne(id: string): Promise<void> {
    await this.scheduleRepository.deleteOne(id);
  }
}
