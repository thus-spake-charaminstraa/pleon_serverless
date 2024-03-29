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
    if (auto) {
      createFeedDto.content = this.feedKindInfos.find(
        (info: any) => info.name_en === createFeedDto.kind,
      ).auto_content;
    }
    return await this.feedRepository.create(createFeedDto);
  }

  async findAllWithDiagnosis(query: GetFeedAndDiagnosisQuery): Promise<any> {
    const ret = await this.feedRepository.findAllWithDiagnosis(query);
    ret.totalCount = ret?.totalCount?.count ? ret.totalCount.count : 0;
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

  async findAllNotCommented(query: any) {
    const feeds = await this.feedRepository.findAllNotCommented(query);
    const ret = [];
    feeds.forEach((feed: any) => {
      const {
        id: feed_id,
        plant_id,
        owner,
        kind,
        content,
        created_at,
        comments,
        diagnosis,
        notis,
      } = feed;
      ret.push({
        feed_id,
        plant_id,
        owner,
        kind,
        content,
        created_at,
        comments,
        diagnosis,
        notis,
      });
    });
    return ret;
  }
}
