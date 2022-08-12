import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  CreateCommentDto,
  DeleteCommentQuery,
  GetCommentQuery,
  UpdateCommentDto,
} from './dto';
import { CommentDocument, Comment } from './entities';

@Injectable()
export class CommentRepository {
  constructor(
    @InjectModel(Comment.name) private model: Model<CommentDocument>,
  ) {}

  async create(createCommentDto: CreateCommentDto): Promise<Comment> {
    const createdEntity = new this.model(createCommentDto);
    return await createdEntity.save();
  }

  async findAll(query: GetCommentQuery): Promise<Comment[]> {
    return await this.model
      .find(query)
      .sort({ created_at: 1 })
      .populate('plant')
      .populate('user')
      .exec();
  }

  async findAllInFeed(feedId: string): Promise<Comment[]> {
    return await this.model
      .find({ feed_id: feedId })
      .sort({ created_at: 1 })
      .populate('plant')
      .populate('user')
      .exec();
  }

  async findOne(id: string): Promise<Comment> {
    return await this.model.findOne({ id }).exec();
  }

  async update(
    id: string,
    updateCommentDto: UpdateCommentDto,
  ): Promise<Comment> {
    return await this.model
      .findOneAndUpdate({ id }, updateCommentDto, { new: true })
      .exec();
  }

  async deleteOne(id: string): Promise<Comment> {
    return await this.model.findOneAndDelete({ id }).exec();
  }

  async deleteAll(query: DeleteCommentQuery): Promise<void> {
    await this.model.deleteMany(query).exec();
  }
}
