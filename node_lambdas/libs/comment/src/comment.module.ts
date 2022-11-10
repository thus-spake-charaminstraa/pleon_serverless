import { Module } from '@nestjs/common';
import { getConnectionToken, MongooseModule } from '@nestjs/mongoose';
import { CommentRepository } from './comment.repository';
import { CommentService } from './comment.service';
import { Comment, CommentSchema } from './entities/comment.entity';
import { NotiModule } from '@app/noti/noti.module';
import { UserModule } from '@app/user/user.module';
import { Plant, PlantSchema } from '@app/plant/entities/plant.entity';
import { Feed, FeedSchema } from '@app/feed/entities/feed.entity';
import { User, UserSchema } from '@app/user/entities/user.entity';
import { Schema, Connection } from 'mongoose';

@Module({
  imports: [
    MongooseModule.forFeatureAsync([
      {
        name: Comment.name,
        imports: [NotiModule],
        useFactory: async (conn: Connection, notiSchema: Schema) => {
          const notiModel = conn.model('Noti', notiSchema);
          const schema = CommentSchema;
          schema.pre(
            'findOneAndDelete',
            { document: false, query: true },
            async function () {
              const { id } = this.getFilter();
              const ret = await Promise.allSettled([
                notiModel.deleteMany({ comment_id: id }),
              ]);
              console.log('comment cascade delete', ret);
            },
          );
          return schema;
        },
        inject: [getConnectionToken(), 'NOTI_SCHEMA'],
      },
      { name: Plant.name, useFactory: () => PlantSchema },
      { name: Feed.name, useFactory: () => FeedSchema },
      { name: User.name, useFactory: () => UserSchema },
    ]),
    NotiModule,
    UserModule,
  ],
  providers: [
    CommentService,
    CommentRepository,
    {
      provide: 'COMMENT_SCHEMA',
      useValue: CommentSchema,
    },
  ],
  exports: [
    CommentService,
    CommentRepository,
    {
      provide: 'COMMENT_SCHEMA',
      useValue: CommentSchema,
    },
  ],
})
export class CommentModule {}
