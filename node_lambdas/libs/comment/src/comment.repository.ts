import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  CommentRes,
  CreateCommentDto,
  DeleteCommentQuery,
  GetCommentQuery,
  UpdateCommentDto,
} from './dto/comment.dto';
import { CommentDocument, Comment } from './entities/comment.entity';
import { CommonRepository } from '@app/common/common.repository';
import { Plant, PlantDocument } from '@app/plant/entities/plant.entity';
import { Feed, FeedDocument } from '@app/feed/entities/feed.entity';
import { User, UserDocument } from '@app/user/entities/user.entity';

@Injectable()
export class CommentRepository extends CommonRepository<
  Comment,
  CreateCommentDto,
  UpdateCommentDto,
  GetCommentQuery
> {
  constructor(
    @InjectModel(Comment.name) private commentModel: Model<CommentDocument>,
    @InjectModel(Plant.name) private plantModel: Model<PlantDocument>,
    @InjectModel(Feed.name) private feedModel: Model<FeedDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {
    super(commentModel);
  }

  async findOne(id: string): Promise<CommentRes> {
    console.log('findOne', id);
    const ret: any = await this.commentModel
      .findOne({ id })
      .populate({
        path: 'plant',
        model: this.plantModel,
      })
      .populate({
        path: 'user',
        model: this.userModel,
      })
      .populate({
        path: 'feed',
        model: this.feedModel,
      })
      .exec();
    console.log(ret);
    return ret;
  }

  async findAll(query: GetCommentQuery): Promise<Comment[]> {
    return await this.commentModel
      .find(query)
      .sort({ created_at: 1 })
      .populate('plant')
      .populate('user')
      .exec();
  }

  async findAllInFeed(feedId: string): Promise<Comment[]> {
    return await this.commentModel
      .find({ feed_id: feedId })
      .sort({ created_at: 1 })
      .populate('plant')
      .populate('user')
      .exec();
  }

  async deleteAll(query: DeleteCommentQuery): Promise<void> {
    await this.commentModel.deleteMany(query).exec();
  }
}
