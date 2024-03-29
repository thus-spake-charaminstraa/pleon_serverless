import { Model } from 'mongoose';

export abstract class CommonRepository<Entity, CreateDto, UpdateDto, GetQuery> {
  private model: Model<any>;
  constructor(model: Model<any>) {
    this.model = model;
  }

  async create(createEntityDto: CreateDto): Promise<Entity> {
    const createdCommon = new this.model(createEntityDto);
    return await createdCommon.save();
  }

  async findAll(query?: GetQuery): Promise<Entity[]> {
    return await this.model.find(query).exec();
  }

  async findOne(id: string): Promise<Entity> {
    return await this.model.findOne({ id }).exec();
  }

  async update(id: string, updateEntityDto: UpdateDto): Promise<Entity> {
    return await this.model
      .findOneAndUpdate({ id }, updateEntityDto, { new: true })
      .exec();
  }

  async findOneAndUpdate(
    query: any,
    updateEntityDto: UpdateDto,
  ): Promise<Entity> {
    return await this.model
      .findOneAndUpdate(query, updateEntityDto, { new: true })
      .exec();
  }

  async deleteOne(id: string): Promise<Entity> {
    return await this.model.findOneAndDelete({ id }).exec();
  }

  async deleteMany(query: any): Promise<any> {
    return await this.model.deleteMany(query).exec();
  }
}
