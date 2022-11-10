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
import { NotiKind } from '@app/noti/types/noti-kind.type';
import { Types } from 'mongoose';

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
    return await this.notiModel
      .find(q)
      .populate('feed')
      .populate('comment')
      .populate('plant')
      .sort({ created_at: -1 })
      .exec();
  }

  async findAllCommentNotiGroupByDate(query: GetNotiQuery): Promise<Noti[]> {
    const { owner, ...q }: any = query;
    if (owner) {
      q.owner = new Types.ObjectId(owner);
    }
    const ret = await this.notiModel.updateMany(
      { owner, is_confirmed: false },
      { is_confirmed: true },
    );
    console.log('comment noti confirm updated', ret);
    return await this.notiModel
      .aggregate()
      .match({
        kind: NotiKind.comment,
        ...q,
      })
      .lookup({
        from: 'feeds',
        localField: 'feed_id',
        foreignField: 'id',
        as: 'feed',
      })
      .unwind({ path: '$feed', preserveNullAndEmptyArrays: true })
      .lookup({
        from: 'comments',
        localField: 'comment_id',
        foreignField: 'id',
        as: 'comment',
      })
      .unwind({ path: '$comment', preserveNullAndEmptyArrays: true })
      .lookup({
        from: 'plants',
        localField: 'plant_id',
        foreignField: 'id',
        as: 'plant',
      })
      .unwind({ path: '$plant', preserveNullAndEmptyArrays: true })
      .sort({ created_at: -1 })
      .group({
        _id: {
          $dateToString: {
            format: '%Y.%m.%d',
            date: '$created_at',
          },
        },
        date: {
          $first: {
            $dateToString: {
              format: '%Y.%m.%d',
              date: '$created_at',
            },
          },
        },
        notis: {
          $push: '$$ROOT',
        },
      })
      .sort({ date: -1 })
      .exec();
  }

  async countNotConfirmedCommentNoti(query: GetNotiQuery) {
    const { owner, ...q } = query;
    return await this.notiModel
      .find({ owner, kind: NotiKind.comment, is_confirmed: false })
      .count()
      .exec();
  }

  async findNotisByPlantId(plant_id: string): Promise<Noti[]> {
    return await this.notiModel
      .find({ plant_id })
      .sort({ created_at: -1 })
      .exec();
  }
}
