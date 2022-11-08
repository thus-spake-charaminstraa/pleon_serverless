import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CommentRepository } from './comment.repository';
import { CommentService } from './comment.service';
import { Comment, CommentSchema } from './entities/comment.entity';
import { NotiModule } from '@app/noti/noti.module';
import { UserModule } from '@app/user/user.module';
import { Plant, PlantSchema } from '@app/plant/entities/plant.entity';
import { Feed, FeedSchema } from '@app/feed/entities/feed.entity';
import { User, UserSchema } from '@app/user/entities/user.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Comment.name, schema: CommentSchema },
      { name: Plant.name, schema: PlantSchema },
      { name: Feed.name, schema: FeedSchema },
      { name: User.name, schema: UserSchema },
    ]),
    NotiModule,
    UserModule,
  ],
  providers: [CommentService, CommentRepository],
  exports: [CommentService, CommentRepository],
})
export class CommentModule {}
