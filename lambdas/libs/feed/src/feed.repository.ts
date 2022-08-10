import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  CreateFeedDto,
  DeleteFeedQuery,
  GetFeedQuery,
  UpdateFeedDto,
} from './dto';
import { Feed, FeedDocument } from './entities/feed.entity';

@Injectable()
export class FeedRepository {
  constructor(@InjectModel(Feed.name) private model: Model<FeedDocument>) {}

  async create(createFeedDto: CreateFeedDto): Promise<Feed> {
    const createdEntity = new this.model({
      ...createFeedDto,
      publish_date: new Date(createFeedDto.publish_date).toISOString(),
    });
    return await createdEntity.save();
  }

  async findAll(query: GetFeedQuery): Promise<Feed[]> {
    const { offset, limit, order_by, ...q } = query;
    return await this.model
      .find(q)
      .sort({ publish_date: order_by === 'asc' ? 1 : -1, created_at: -1 })
      .skip(offset)
      .limit(limit)
      .populate('plant')
      .populate('comments')
      .exec();
  }

  async findOne(id: string): Promise<Feed> {
    return await this.model
      .findOne({ id })
      .populate('plant')
      .populate('comments')
      .exec();
  }

  async update(id: string, updateFeedDto: UpdateFeedDto): Promise<Feed> {
    return await this.model
      .findOneAndUpdate({ id }, updateFeedDto, { new: true })
      .exec();
  }

  async deleteOne(id: string): Promise<Feed> {
    return await this.model.findOneAndDelete({ id }).exec();
  }

  async deleteAll(query: DeleteFeedQuery): Promise<void> {
    await this.model.deleteMany(query).exec();
  }
}
