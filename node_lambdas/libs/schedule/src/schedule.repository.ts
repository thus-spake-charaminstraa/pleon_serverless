import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  CreateScheduleDto,
  UpdateScheduleDto,
  GetScheduleQuery,
  DeleteScheduleQuery,
} from './dto/schedule.dto';
import { Schedule, ScheduleDocument } from './entities/schedule.entity';
import { ScheduleKind } from './types/schedule-kind.enum';

@Injectable()
export class ScheduleRepository {
  constructor(
    @InjectModel(Schedule.name) private scheduleModel: Model<ScheduleDocument>,
  ) {}

  async create(createScheduleDto: CreateScheduleDto): Promise<Schedule> {
    const createdSchedule = new this.scheduleModel(createScheduleDto);
    return await createdSchedule.save();
  }

  async findAll(query: GetScheduleQuery): Promise<any[]> {
    return await this.scheduleModel.find(query).populate('plant').exec();
  }

  async findAllAndGroupBy(query: GetScheduleQuery): Promise<any> {
    const ret = await this.scheduleModel
      .aggregate()
      .match({
        plant_id: new Types.ObjectId(query.plant_id),
        timestamp: { $gte: query.start, $lte: query.end },
      })
      .group({
        _id: '$timestamp',
        timestamp: { $first: '$timestamp' },
        kinds: { $push: '$kind' },
      })
      .sort({ timestamp: 1 })
      .exec();
    return ret;
  }

  async findOne(id: string): Promise<Schedule> {
    return await this.scheduleModel.findOne({ id }).exec();
  }

  async findByPlantAndGroup(plantId: string): Promise<any> {
    const ret = {};
    for (const kind of Object.keys(ScheduleKind)) {
      ret[kind] = await this.scheduleModel
        .find({ plant_id: plantId, kind: ScheduleKind[kind] })
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

  async deleteOne(id: string): Promise<any> {
    return await this.scheduleModel.findOneAndDelete({ id }).exec();
  }

  async deleteAll(query: DeleteScheduleQuery): Promise<void> {
    await this.scheduleModel.deleteMany(query).exec();
  }
}
