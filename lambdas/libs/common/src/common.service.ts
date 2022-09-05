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
    return await this.repository.findOne(id);
  }

  async update(id: string, updateEntityDto: UpdateDto): Promise<Entity> {
    return await this.repository.update(id, updateEntityDto);
  }

  async deleteOne(id: string): Promise<void> {
    await this.repository.deleteOne(id);
  }
}
