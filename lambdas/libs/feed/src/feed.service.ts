import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateFeedDto, UpdateFeedDto } from './dto/feed.dto';
import { Feed } from './entities/feed.entity';
import { FeedRepository } from './feed.repository';

@Injectable()
export class FeedService {
  constructor(
    private readonly feedRepository: FeedRepository,
  ) { }
  
  async create(createFeedDto: CreateFeedDto): Promise<Feed> {
    return await this.feedRepository.create(createFeedDto);
  }

  async findAll(): Promise<Feed[]> {
    return await this.feedRepository.findAll();
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

  async delete(id: string): Promise<void> {
    const ret = await this.feedRepository.delete(id);
    if (!ret) {
      throw new NotFoundException(`Feed with id ${id} not found`);
    }
  }
}
