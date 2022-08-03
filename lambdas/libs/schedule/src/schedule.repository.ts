import { ScheduleKind } from '@app/common/types';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateScheduleDto, UpdateScheduleDto, GetScheduleQuery } from './dto/schedule.dto';
import { Schedule, ScheduleDocument } from './entities/schedule.entity';

@Injectable()
export class ScheduleRepository {
  constructor(
    @InjectModel(Schedule.name) private scheduleModel: Model<ScheduleDocument>,
  ) {}

  async create(createScheduleDto: CreateScheduleDto): Promise<Schedule> {
    const createdSchedule = new this.scheduleModel(createScheduleDto);
    return await createdSchedule.save();
  }

  async findAll(query: GetScheduleQuery): Promise<Schedule[]> {
    return await this.scheduleModel.find(query).exec();
  }

  async findOne(id: string): Promise<Schedule> {
    return await this.scheduleModel.findOne({ id }).exec();
  }

  async findByPlantAndGroup(plantId: string): Promise<any> {
    let ret = {};
    for (let kind of Object.keys(ScheduleKind)) {
      ret[kind] = await this.scheduleModel
        .find({ plant_id: plantId, kind })
        .sort({ timestamp: -1 })
        .exec();
    }
    return ret;
  }

  async update(
    id: string,
    updatescheduleDto: UpdateScheduleDto,
  ): Promise<Schedule> {
    return await this.scheduleModel
      .findOneAndUpdate({ id }, updatescheduleDto, { new: true })
      .exec();
  }

  async remove(id: string): Promise<any> {
    return await this.scheduleModel.deleteOne({ id }).exec();
  }
}