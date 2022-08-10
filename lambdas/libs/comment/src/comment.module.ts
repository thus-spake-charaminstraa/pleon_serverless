import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CommentRepository } from './comment.repository';
import { CommentService } from './comment.service';
import { Comment, CommentSchema } from './entities';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Comment.name, schema: CommentSchema }]),
  ],
  providers: [CommentService, CommentRepository],
  exports: [CommentService, CommentRepository],
})
export class CommentModule {}
