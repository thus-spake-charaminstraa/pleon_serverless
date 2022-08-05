import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from 'mongoose';
import { Noti, NotiDocument } from "./entities";
import { CreateNotiDto, GetNotiQuery, UpdateNotiDto } from './dto';

@Injectable()
export class NotiRepository {
  constructor(@InjectModel(Noti.name) private model: Model<NotiDocument>) {}

  async create(createNotiDto: CreateNotiDto): Promise<Noti> {
    const createdEntity = new this.model({
      ...createNotiDto,
    });
    return await createdEntity.save();
  }

  async findAll(query: GetNotiQuery): Promise<Noti[]> {
    const { ...q } = query;
    return this.model.find(q).exec();
  }

  async findOne(id: string): Promise<Noti> {
    return this.model.findOne({ id }).exec();
  }

  async update(id: string, updateNotiDto: UpdateNotiDto): Promise<Noti> {
    return this.model
      .findOneAndUpdate({ id }, updateNotiDto, { new: true })
      .exec();
  }

  async deleteOne(id: string): Promise<Noti> {
    return this.model.findOneAndDelete({ id }).exec();
  }
}