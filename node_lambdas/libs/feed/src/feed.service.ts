import {
  Inject,
  Injectable,
  NotFoundException,
  forwardRef,
} from '@nestjs/common';
import { CreateFeedDto, GetFeedQuery, UpdateFeedDto } from './dto/feed.dto';
import { Feed } from './entities/feed.entity';
import { FeedRepository } from './feed.repository';
import {
  ScheduleRepository,
  CreateScheduleDto,
  ScheduleKind,
} from '@app/schedule';

@Injectable()
export class FeedService {
  constructor(
    private readonly feedRepository: FeedRepository,
    @Inject(forwardRef(() => ScheduleRepository))
    private readonly scheduleRepository: ScheduleRepository,
  ) {}

  async create(createFeedDto: CreateFeedDto): Promise<Feed> {
    if (createFeedDto.kind in ScheduleKind) {
      let kind: any = createFeedDto.kind;
      const createScheduleDto: CreateScheduleDto = {
        plant_id: createFeedDto.plant_id,
        timestamp: createFeedDto.publish_date,
        kind,
      };
      const ret = await this.scheduleRepository.create(createScheduleDto);
      createFeedDto.schedule_id = ret.id.toString();
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
