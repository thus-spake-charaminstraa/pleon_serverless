import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateFeedDto, GetFeedQuery, UpdateFeedDto } from './dto';
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
    return this.model
      .find(q)
      .sort({ publish_date: order_by === 'asc' ? 1 : -1 })
      .skip(offset)
      .limit(limit)
      .populate('plant')
      .exec();
  }

  async findOne(id: string): Promise<Feed> {
    return this.model.findOne({ id }).exec();
  }

  async update(id: string, updateFeedDto: UpdateFeedDto): Promise<Feed> {
    return this.model
      .findOneAndUpdate({ id }, updateFeedDto, { new: true })
      .exec();
  }

  async delete(id: string): Promise<Feed> {
    return this.model.findOneAndDelete({ id }).exec();
  }
}
