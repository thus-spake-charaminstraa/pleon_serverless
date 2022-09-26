import { CreateScheduleDto, ScheduleKind } from '@app/schedule';
import { ScheduleRepository } from '@app/schedule/schedule.repository';
import {
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateFeedDto, GetFeedQuery, UpdateFeedDto } from './dto';
import { Feed } from './entities';
import { FeedRepository } from './feed.repository';
import { FeedKind } from './types';

@Injectable()
export class FeedService {
  feedKindInfos: any;
  constructor(
    private readonly feedRepository: FeedRepository,
    @Inject(forwardRef(() => ScheduleRepository))
    private readonly scheduleRepository: ScheduleRepository,
  ) {
    this.feedKindInfos = [
      {
        name_kr: '오늘의모습',
        name_en: 'today',
        icon_uri:
          'https://pleon-image-main.s3.ap-northeast-2.amazonaws.com/icon_today.svg',
        auto_content: '오늘의 모습은 아주 이쁘다!',
      },
      {
        name_kr: '물',
        name_en: 'water',
        icon_uri:
          'https://pleon-image-main.s3.ap-northeast-2.amazonaws.com/icon_water.svg',
        auto_content: '시원한 물을 뿌려주었다!',
      },
      {
        name_kr: '통풍',
        name_en: 'air',
        icon_uri:
          'https://pleon-image-main.s3.ap-northeast-2.amazonaws.com/icon_air.svg',
        auto_content: '신선한 공기로 숨 돌리게 해주었다!',
      },
      {
        name_kr: '분무',
        name_en: 'spray',
        icon_uri:
          'https://pleon-image-main.s3.ap-northeast-2.amazonaws.com/icon_spray.svg',
        auto_content: '잎이 건조하지 않게 분무를 해주었다!',
      },
      {
        name_kr: '영양제',
        name_en: 'nutrition',
        icon_uri:
          'https://pleon-image-main.s3.ap-northeast-2.amazonaws.com/icon_nutrition.svg',
        auto_content: '집에 먹을게 없어서 비료를 넣어주었다!',
      },
      {
        name_kr: '분갈이',
        name_en: 'repot',
        icon_uri:
          'https://pleon-image-main.s3.ap-northeast-2.amazonaws.com/icon_repot.svg',
        auto_content: '새 집으로 이사해주었다!',
      },
      {
        name_kr: '가지치기',
        name_en: 'prune',
        icon_uri:
          'https://pleon-image-main.s3.ap-northeast-2.amazonaws.com/icon_prune.svg',
        auto_content: '이쁘게 다듬었다!',
      },
      {
        name_kr: '잎',
        name_en: 'leaf',
        icon_uri:
          'https://pleon-image-main.s3.ap-northeast-2.amazonaws.com/icon_leaf.svg',
        auto_content: '잎이 멋지다!',
      },
      {
        name_kr: '꽃',
        name_en: 'flower',
        icon_uri:
          'https://pleon-image-main.s3.ap-northeast-2.amazonaws.com/icon_flower.svg',
        auto_content: '꽃이 이쁘다!',
      },
      {
        name_kr: '열매',
        name_en: 'fruit',
        icon_uri:
          'https://pleon-image-main.s3.ap-northeast-2.amazonaws.com/icon_fruit.svg',
        auto_content: '열매가 맺혔다!',
      },
      {
        name_kr: '기타',
        name_en: 'etc',
        icon_uri:
          'https://pleon-image-main.s3.ap-northeast-2.amazonaws.com/icon_etc.svg',
        auto_content: '어떤 일이 있었다!',
      },
    ];
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
      createFeedDto.content =
        this.feedKindInfos[createFeedDto.kind].auto_content;
    }
    return await this.feedRepository.create(createFeedDto);
  }

  async findAll(query: GetFeedQuery): Promise<Feed[]> {
    return await this.feedRepository.findAll(query);
  }

  async findOne(id: string): Promise<Feed> {
    const ret = await this.feedRepository.findOne(id);
    if (!ret) {
      throw new NotFoundException(`Feed with id ${id} not found`);
    }
    return ret;
  }

  async update(id: string, updateFeedDto: UpdateFeedDto): Promise<Feed> {
    const ret = await this.feedRepository.update(id, updateFeedDto);
    if (!ret) {
      throw new NotFoundException(`Feed with id ${id} not found`);
    }
    return ret;
  }

  async deleteOne(id: string): Promise<void> {
    const ret = await this.feedRepository.deleteOne(id);
    if (!ret) {
      throw new NotFoundException(`Feed with id ${id} not found`);
    }
  }
}
