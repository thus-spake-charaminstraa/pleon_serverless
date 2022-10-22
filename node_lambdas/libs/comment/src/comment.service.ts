import { Injectable } from '@nestjs/common';
import { CommentRepository } from './comment.repository';
import {
  CreateCommentDto,
  GetCommentQuery,
  UpdateCommentDto,
} from './dto/comment.dto';
import { Comment } from '@app/comment/entities/comment.entity';

@Injectable()
export class CommentService {
  constructor(private readonly commentRepository: CommentRepository) {}

  async create(createCommentDto: CreateCommentDto): Promise<Comment> {
    const ret = await this.commentRepository.create(createCommentDto);
    return ret;
  }

  async findAll(query: GetCommentQuery): Promise<Comment[]> {
    return await this.commentRepository.findAll(query);
  }

  async findAllInFeed(feedId: string): Promise<Comment[]> {
    return await this.commentRepository.findAllInFeed(feedId);
  }

  async findOne(id: string): Promise<Comment> {
    return await this.commentRepository.findOne(id);
  }

  async update(
    id: string,
    updateCommentDto: UpdateCommentDto,
  ): Promise<Comment> {
    const ret = await this.commentRepository.update(id, updateCommentDto);
    return ret;
  }

  async deleteOne(id: string): Promise<Comment> {
    return await this.commentRepository.deleteOne(id);
  }
}
