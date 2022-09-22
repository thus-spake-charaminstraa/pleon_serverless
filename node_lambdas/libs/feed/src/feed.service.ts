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
  feedAutoContent: any;
  constructor(
    private readonly feedRepository: FeedRepository,
    @Inject(forwardRef(() => ScheduleRepository))
    private readonly scheduleRepository: ScheduleRepository,
  ) {
    this.feedAutoContent = {
      [FeedKind.water]: '시원한 물을 뿌려주었다!',
      [FeedKind.air]: '신선한 공기로 숨 돌리게 해주었다!',
      [FeedKind.spray]: '잎이 건조하지 않게 분무를 해주었다!',
      [FeedKind.fertilize]: '집에 먹을게 없어서 비료를 넣어주었다!',
      [FeedKind.repot]: '새 집으로 이사해주었다!',
      [FeedKind.prune]: '이쁘게 다듬었다!',
      [FeedKind.today]: '오늘의 모습은 아주 이쁘다!',
      [FeedKind.leaf]: '잎이 멋지다!',
      [FeedKind.flower]: '꽃이 이쁘다!',
      [FeedKind.fruit]: '열매가 맺혔다!',
      [FeedKind.etc]: '어떤 일이 있었다!',
    };
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
      createFeedDto.content = this.feedAutoContent[createFeedDto.kind];
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
