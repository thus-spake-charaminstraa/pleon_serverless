import { Module, forwardRef } from '@nestjs/common';
import { FeedService } from './feed.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Feed, FeedSchema } from './entities/feed.entity';
import { FeedRepository } from './feed.repository';
import { NotiService } from '@app/noti/noti.service';
import { CommentService } from '@app/comment/comment.service';
import { NotiModule } from '@app/noti/noti.module';
import { CommentModule } from '@app/comment/comment.module';

@Module({
  imports: [
    MongooseModule.forFeatureAsync([
      {
        name: Feed.name,
        imports: [NotiModule, CommentModule],
        useFactory: async (
          notiService: NotiService,
          commentService: CommentService,
        ) => {
          const schema = FeedSchema;
          schema.pre(
            'findOneAndDelete',
            { document: false, query: true },
            async function () {
              const { id } = this.getFilter();
              await Promise.all([
                commentService.deleteMany({ feed_id: id }),
                notiService.deleteMany({ feed_id: id }),
              ]);
            },
          );
          return schema;
        },
        inject: [NotiService, CommentService],
      },
    ]),
  ],
  providers: [FeedService, FeedRepository],
  exports: [FeedService, FeedRepository],
})
export class FeedModule {}
