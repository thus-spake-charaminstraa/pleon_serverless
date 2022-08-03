import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateFeedDto, GetFeedQuery, UpdateFeedDto } from './dto/feed.dto';
import { Feed } from './entities/feed.entity';
import { FeedRepository } from './feed.repository';

@Injectable()
export class FeedService {
  constructor(private readonly feedRepository: FeedRepository) {}

  async create(createFeedDto: CreateFeedDto): Promise<Feed> {
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
