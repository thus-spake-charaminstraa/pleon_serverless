export abstract class CommonRepository<Entity, CreateDto, UpdateDto, GetQuery> {
  private model: any;
  constructor(model: any) {
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

  async deleteOne(id: string): Promise<void> {
    await this.model.findOneAndDelete({ id }).exec();
  }

  async deleteMany(query: any): Promise<void> {
    await this.model.deleteMany(query).exec();
  }
}
