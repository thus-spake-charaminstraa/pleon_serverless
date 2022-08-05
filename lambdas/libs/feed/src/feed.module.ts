import { Module } from '@nestjs/common';
import { FeedService } from './feed.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Feed, FeedSchema } from './entities/feed.entity';
import { FeedRepository } from './feed.repository';
import { ScheduleModule } from '@app/schedule';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Feed.name, schema: FeedSchema }]),
    ScheduleModule,
  ],
  providers: [FeedService, FeedRepository],
  exports: [FeedService, FeedRepository],
})
export class FeedModule {}
