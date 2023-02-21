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
import { CommonRepository } from '@app/common/common.repository';

@Injectable()
export class FeedRepository extends CommonRepository<
  Feed,
  CreateFeedDto,
  UpdateFeedDto,
  GetFeedAndDiagnosisQuery
> {
  constructor(@InjectModel(Feed.name) private feedModel: Model<FeedDocument>) {
    super(feedModel);
  }

  async create(createFeedDto: CreateFeedDto): Promise<Feed> {
    const createdEntity = new this.feedModel({
      ...createFeedDto,
      publish_date: new Date(createFeedDto.publish_date).toISOString(),
    });
    return await createdEntity.save();
  }

  async findAll(query: GetFeedAndDiagnosisQuery) {
    const { offset, limit, start, end, ...q } = query;
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
    const ret = await this.feedModel
      .find(q)
      .sort({ created_at: -1 })
      .skip(offset)
      .limit(limit)
      .populate({
        path: 'comments',
        populate: ['user', 'plant'],
      })
      .populate('plant')
      .populate('user')
      .exec();
    return ret;
  }

  async findAllWithDiagnosis(query: GetFeedAndDiagnosisQuery): Promise<any> {
    const { offset, limit, start, end, ...q } = query;
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
    const ret = await this.feedModel
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
    const ret = await this.feedModel
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
    const ret = await this.feedModel
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
    return await this.feedModel
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
    const { start, end, ...q } = query;
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
    else {
      const now = new Date();
      q.created_at = {
        $gte: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 7),
        $lte: now,
      };
    }
    const ret = await this.feedModel
      .aggregate()
      .match(q)
      .lookup({
        from: 'comments',
        localField: 'id',
        foreignField: 'feed_id',
        as: 'comments',
      })
      .addFields({
        last_comment_author_kind: {
          $arrayElemAt: ['$comments.author_kind', -1],
        },
      })
      .match({
        $or: [
          { comments: { $size: 0 } },
          { last_comment_author_kind: { $ne: 'plant' } },
        ],
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
      .lookup({
        from: 'diagnoses',
        localField: 'plant_id',
        foreignField: 'plant_id',
        pipeline: [
          { $sort: { created_at: -1 } },
          { $limit: 1 },
          {
            $addFields: {
              time_diff: { $subtract: [new Date(), '$created_at'] },
            },
          },
          {
            $match: {
              time_diff: {
                $lte: 1000 * 60 * 60 * 24 * 7,
              },
            },
          },
        ],
        as: 'diagnosis',
      })
      .lookup({
        from: 'notis',
        localField: 'plant_id',
        foreignField: 'plant_id',
        pipeline: [
          {
            $match: {
              kind: {
                $ne: 'comment',
              },
            },
          },
        ],
        as: 'notis',
      })
      .unwind({ path: '$noti', preserveNullAndEmptyArrays: true })
      .sort({ created_at: -1 })
      .exec();
    return ret;
  }

  async update(id: string, updateFeedDto: UpdateFeedDto): Promise<Feed> {
    return await this.feedModel
      .findOneAndUpdate({ id }, updateFeedDto, { new: true })
      .exec();
  }

  async deleteOne(id: string): Promise<Feed> {
    return await this.feedModel.findOneAndDelete({ id }).exec();
  }

  async deleteAll(query: DeleteFeedQuery): Promise<void> {
    await this.feedModel.deleteMany(query).exec();
  }
}
