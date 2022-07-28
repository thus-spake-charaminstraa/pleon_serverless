import { Injectable } from '@nestjs/common';
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
    return await this.feedRepository.findOne(id);
  }

  async update(id: string, updateFeedDto: UpdateFeedDto): Promise<Feed> {
    return await this.feedRepository.update(id, updateFeedDto);
  }

  async delete(id: string): Promise<Feed> {
    return await this.feedRepository.delete(id);
  }
}
