import { Module } from '@nestjs/common';
import { FeedService } from './feed.service';
import { MongooseModule, getConnectionToken } from '@nestjs/mongoose';
import { Feed, FeedSchema } from './entities/feed.entity';
import { FeedRepository } from './feed.repository';
import { NotiModule } from '@app/noti/noti.module';
import { CommentModule } from '@app/comment/comment.module';
import { Schema, Connection } from 'mongoose';

@Module({
  imports: [
    MongooseModule.forFeatureAsync([
      {
        name: Feed.name,
        imports: [NotiModule, CommentModule],
        useFactory: (
          conn: Connection,
          notiSchema: Schema,
          commentSchema: Schema,
        ) => {
          let schema = FeedSchema;
          let notiModel = conn.model('Noti', notiSchema);
          let commentModel = conn.model('Comment', commentSchema);
          schema = schema.pre(
            'findOneAndDelete',
            { document: false, query: true },
            async function () {
              const { id } = this.getFilter();
              const ret = await Promise.allSettled([
                commentModel.deleteMany({ feed_id: id }),
                notiModel.deleteMany({ feed_id: id }),
              ]);
              console.log('feed cascade delete', ret);
            },
          );
          return schema;
        },
        inject: [getConnectionToken(), 'NOTI_SCHEMA', 'COMMENT_SCHEMA'],
      },
    ]),
  ],
  providers: [
    FeedService,
    FeedRepository,
    {
      provide: 'FEED_SCHEMA',
      useValue: FeedSchema,
    },
  ],
  exports: [
    FeedService,
    FeedRepository,
    {
      provide: 'FEED_SCHEMA',
      useValue: FeedSchema,
    },
  ],
})
export class FeedModule {}
