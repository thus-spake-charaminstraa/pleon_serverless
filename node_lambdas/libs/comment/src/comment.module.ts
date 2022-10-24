import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CommentRepository } from './comment.repository';
import { CommentService } from './comment.service';
import { Comment, CommentSchema } from './entities/comment.entity';
import { NotiModule } from '@app/noti/noti.module';
import { UserModule } from '@app/user/user.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Comment.name, schema: CommentSchema }]),
    NotiModule,
    UserModule,
  ],
  providers: [CommentService, CommentRepository],
  exports: [CommentService, CommentRepository],
})
export class CommentModule {}
