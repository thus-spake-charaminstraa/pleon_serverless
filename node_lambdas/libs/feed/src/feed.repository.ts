import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  CreateFeedDto,
  DeleteFeedQuery,
  GetFeedCalendarQuery,
  GetFeedAndDiagnosisQuery,
  UpdateFeedDto,
} from './dto/feed.dto';
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

  async findAll(query: GetFeedAndDiagnosisQuery): Promise<any> {
    const { offset, limit, order_by, publish_date, start, end, ...q } = query;
    if (q.plant_id) {
      q.plant_id = new Types.ObjectId(q.plant_id);
    }
    if (q.owner) {
      q.owner = new Types.ObjectId(q.owner);
    }
    if (start && end)
      q.created_at = {
        $gte: start,
        $lte: end,
      };
    const ret = await this.model
      .aggregate()
      .unionWith({
        coll: 'diagnoses',
      })
      .match(q)
      .sort({ created_at: -1 })
      .facet({
        totalCount: [{ $count: 'count' }],
        data: [
          { $skip: offset },
          { $limit: limit },
          {
            $lookup: {
              from: 'plants',
              localField: 'plant_id',
              foreignField: 'id',
              pipeline: [{ $limit: 1 }],
              as: 'plant',
            },
          },
          {
            $unwind: {
              path: '$plant',
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $lookup: {
              from: 'users',
              localField: 'owner',
              foreignField: 'id',
              pipeline: [{ $limit: 1 }],
              as: 'user',
            },
          },
          {
            $unwind: {
              path: '$user',
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $lookup: {
              from: 'comments',
              localField: 'id',
              foreignField: 'feed_id',
              as: 'comments',
              pipeline: [
                {
                  $lookup: {
                    from: 'users',
                    localField: 'user_id',
                    foreignField: 'id',
                    pipeline: [{ $limit: 1 }],
                    as: 'user',
                  },
                },
                {
                  $lookup: {
                    from: 'plants',
                    localField: 'plant_id',
                    foreignField: 'id',
                    pipeline: [{ $limit: 1 }],
                    as: 'plant',
                  },
                },
                {
                  $unwind: {
                    path: '$user',
                    preserveNullAndEmptyArrays: true,
                  },
                },
                {
                  $unwind: {
                    path: '$plant',
                    preserveNullAndEmptyArrays: true,
                  },
                },
              ],
            },
          },
        ],
      })
      .unwind({
        path: '$totalCount',
        preserveNullAndEmptyArrays: true,
      })
      .exec();
    return ret[0];
  }

  async findAllAndGroupBy(query: GetFeedCalendarQuery): Promise<any> {
    const ret = await this.model
      .aggregate()
      .match({
        plant_id: new Types.ObjectId(query.plant_id),
        publish_date: { $gte: query.start, $lte: query.end },
      })
      .group({
        _id: '$publish_date',
        timestamp: { $first: '$publish_date' },
        kinds: { $push: '$kind' },
      })
      .sort({ timestamp: 1 })
      .exec();
    return ret;
  }

  async findByPlantAndGroup(plantId: string): Promise<any> {
    const ret = await this.model
      .aggregate()
      .match({ plant_id: new Types.ObjectId(plantId) })
      .sort({ created_at: -1 })
      .group({
        _id: '$kind',
        kind: { $first: '$kind' },
        feeds: { $push: '$$ROOT' },
      })
      .exec();
    return ret;
  }

  async findOne(id: string): Promise<Feed> {
    return await this.model
      .findOne({ id })
      .populate('plant')
      .populate({
        path: 'comments',
        populate: ['user', 'plant'],
      })
      .populate('user')
      .exec();
  }

  async findAllNotCommented(query: any) {
    const { start, end, publish_date, ...q } = query;
    if (q.plant_id) {
      q.plant_id = new Types.ObjectId(q.plant_id);
    }
    if (q.owner) {
      q.owner = new Types.ObjectId(q.owner);
    } else {
      q.owner = { $ne: new Types.ObjectId('62c3dd65ff76f24d880331a9') };
    }
    if (start && end)
      q.created_at = {
        $gte: start,
        $lte: end,
      };
    const ret = await this.model
      .aggregate()
      .match(q)
      .lookup({
        from: 'comments',
        localField: 'id',
        foreignField: 'feed_id',
        as: 'comments',
      })
      .match({
        comments: { $size: 0 },
      })
      .lookup({
        from: 'users',
        localField: 'owner',
        foreignField: 'id',
        pipeline: [{ $limit: 1 }],
        as: 'user',
      })
      .unwind({
        path: '$user',
        preserveNullAndEmptyArrays: true,
      })
      .lookup({
        from: 'plants',
        localField: 'plant_id',
        foreignField: 'id',
        pipeline: [{ $limit: 1 }],
        as: 'plant',
      })
      .unwind({
        path: '$plant',
        preserveNullAndEmptyArrays: true,
      })
      .sort({ created_at: -1 })
      .exec();
    return ret;
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
