import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { Feed } from './entities/feed.entity';
import { FeedRepository } from './feed.repository';
import { FeedKindInfos } from './resources/feed-kind-infos';
import { FeedKind } from './types/feed-kind.type';
import { CommonService } from '@app/common/common.service';
import {
  CreateFeedDto,
  GetFeedCalendarQuery,
  GetFeedAndDiagnosisQuery,
  UpdateFeedDto,
} from './dto/feed.dto';

@Injectable()
export class FeedService extends CommonService<
  Feed,
  CreateFeedDto,
  UpdateFeedDto,
  GetFeedAndDiagnosisQuery
> {
  feedKindInfos: any;
  constructor(
    @Inject(forwardRef(() => FeedRepository))
    private readonly feedRepository: FeedRepository,
  ) {
    super(feedRepository);
    this.feedKindInfos = FeedKindInfos;
  }

  async getFeedKindInfo(kind?: FeedKind): Promise<any> {
    if (kind) return this.feedKindInfos[kind];
    return this.feedKindInfos;
  }

  async create(createFeedDto: CreateFeedDto, auto?: boolean): Promise<Feed> {
    // if (createFeedDto.kind in ScheduleKind) {
    //   const kind: any = createFeedDto.kind;
    //   const createScheduleDto: CreateScheduleDto = {
    //     plant_id: createFeedDto.plant_id,
    //     timestamp: createFeedDto.publish_date,
    //     kind,
    //   };
    //   const ret = await this.scheduleRepository.create(createScheduleDto);
    //   createFeedDto.schedule_id = ret.id.toString();
    // }
    if (auto) {
      createFeedDto.content = this.feedKindInfos.find(
        (info: any) => info.name_en === createFeedDto.kind,
      ).auto_content;
    }
    return await this.feedRepository.create(createFeedDto);
  }

  async findAll(query: GetFeedAndDiagnosisQuery): Promise<any> {
    const ret = await this.feedRepository.findAll(query);
    ret.totalCount = ret?.totalCount?.count;
    return ret;
  }

  async findAllAndGroupBy(query: GetFeedCalendarQuery): Promise<any> {
    const ret = await this.feedRepository.findAllAndGroupBy(query);
    ret.forEach((item: any) => {
      item.kinds = item.kinds.map((kind: FeedKind) =>
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

  async findByPlantAndGroup(plantId: string): Promise<any> {
    const ret = await this.feedRepository.findByPlantAndGroup(plantId);
    const group = {};
    ret.forEach((item: any) => {
      group[item.kind] = item.feeds;
    });
    return group;
  }
}
