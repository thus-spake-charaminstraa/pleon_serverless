import { NotFoundException } from '@nestjs/common';

export abstract class CommonService<Entity, CreateDto, UpdateDto, GetQuery> {
  constructor(private repository: any) {
    this.repository = repository;
  }

  async create(createEntityDto: CreateDto): Promise<Entity> {
    return await this.repository.create(createEntityDto);
  }

  async findAll(query?: GetQuery): Promise<Entity[]> {
    return await this.repository.findAll(query);
  }

  async findOne(id: string): Promise<Entity> {
    const ret = await this.repository.findOne(id);
    if (!ret) {
      throw new NotFoundException('존재하지 않는 데이터입니다.');
    }
    return ret;
  }

  async update(id: string, updateEntityDto: UpdateDto): Promise<Entity> {
    const ret = await this.repository.update(id, updateEntityDto);
    if (!ret) {
      throw new NotFoundException('존재하지 않는 데이터입니다.');
    }
    return ret;
  }

  async deleteOne(id: string): Promise<void> {
    const ret = await this.repository.deleteOne(id);
    if (!ret) {
      throw new NotFoundException('존재하지 않는 데이터입니다.');
    }
  }
}
