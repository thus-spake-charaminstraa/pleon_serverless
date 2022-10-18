import { CreateScheduleDto, ScheduleKind } from '@app/schedule';
import { ScheduleRepository } from '@app/schedule/schedule.repository';
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { Feed } from './entities/feed.entity';
import { FeedRepository } from './feed.repository';
import { FeedKindInfos } from './resources/feed-kind-infos';
import { FeedKind } from './types/feed-kind.type';
import { CommonService } from '@app/common/common.service';
import {
  CreateFeedDto,
  GetFeedCalendarQuery,
  GetFeedQuery,
  UpdateFeedDto,
} from './dto/feed.dto';

@Injectable()
export class FeedService extends CommonService<
  Feed,
  CreateFeedDto,
  UpdateFeedDto,
  GetFeedQuery
> {
  feedKindInfos: any;
  constructor(
    @Inject(forwardRef(() => FeedRepository))
    private readonly feedRepository: FeedRepository,
    @Inject(forwardRef(() => ScheduleRepository))
    private readonly scheduleRepository: ScheduleRepository,
  ) {
    super(feedRepository);
    this.feedKindInfos = FeedKindInfos;
  }

  async getFeedKindInfo(kind?: FeedKind): Promise<any> {
    if (kind) return this.feedKindInfos[kind];
    return this.feedKindInfos;
  }

  async create(createFeedDto: CreateFeedDto, auto?: boolean): Promise<Feed> {
    if (createFeedDto.kind in ScheduleKind) {
      const kind: any = createFeedDto.kind;
      const createScheduleDto: CreateScheduleDto = {
        plant_id: createFeedDto.plant_id,
        timestamp: createFeedDto.publish_date,
        kind,
      };
      const ret = await this.scheduleRepository.create(createScheduleDto);
      createFeedDto.schedule_id = ret.id.toString();
    }
    if (auto) {
      createFeedDto.content = this.feedKindInfos.find(
        (info) => info.name_en === createFeedDto.kind,
      ).auto_content;
    }
    return await this.feedRepository.create(createFeedDto);
  }

  async findAllAndGroupBy(query: GetFeedCalendarQuery): Promise<any> {
    const ret = await this.feedRepository.findAllAndGroupBy(query);
    ret.forEach((item) => {
      item.kinds = item.kinds.map((kind) =>
        kind == FeedKind.water
          ? 'water'
          : kind == FeedKind.air
          ? 'air'
          : kind == FeedKind.prune
          ? 'prune'
          : kind == FeedKind.spray
          ? 'spray'
          : kind == FeedKind.nutrition
          ? 'nutrition'
          : 'etc',
      );
    });
    return ret;
  }
}
