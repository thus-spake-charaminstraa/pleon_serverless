import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Noti, NotiDocument } from './entities/noti.entity';
import {
  CreateNotiDto,
  GetGuideNotiQuery,
  GetNotiQuery,
  UpdateNotiDto,
} from './dto/noti.dto';
import { CommonRepository } from '@app/common/common.repository';

@Injectable()
export class NotiRepository extends CommonRepository<
  Noti,
  CreateNotiDto,
  UpdateNotiDto,
  GetNotiQuery
> {
  constructor(@InjectModel(Noti.name) private notiModel: Model<NotiDocument>) {
    super(notiModel);
  }

  async findAllGuideNoti(query: GetGuideNotiQuery): Promise<Noti[]> {
    const { kinds } = query;
    if (kinds) {
      query.kind = { $in: kinds };
    }
    return await this.notiModel.find(query).sort({ created_at: -1 }).exec();
  }

  async findAll(query: GetNotiQuery): Promise<Noti[]> {
    const { ...q } = query;
    return await this.notiModel.find(q).sort({ created_at: -1 }).exec();
  }

  async findNotisByPlantId(plant_id: string): Promise<Noti[]> {
    return await this.notiModel
      .find({ plant_id })
      .sort({ created_at: -1 })
      .exec();
  }
}
