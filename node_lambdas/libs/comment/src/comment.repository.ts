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

@Injectable()
export class CommentRepository extends CommonRepository<
  Comment,
  CreateCommentDto,
  UpdateCommentDto,
  GetCommentQuery
> {
  constructor(
    @InjectModel(Comment.name) private commentModel: Model<CommentDocument>,
  ) {
    super(commentModel);
  }

  async findOne(id: string): Promise<CommentRes> {
    const ret: any = await this.commentModel
      .findOne({ id })
      .populate('plant')
      .populate('user')
      .populate('feed')
      .exec();
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
