import { Injectable } from '@nestjs/common';
import { CommonRepository } from '@app/common/common.repository';
import { Species, SpeciesDocument } from '../entities/species.entity';
import { CreateSpeciesDto } from '../dto/species.dto';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class SpeciesRepository extends CommonRepository<
  Species,
  CreateSpeciesDto,
  any,
  any
> {
  constructor(
    @InjectModel(Species.name) private speciesModel: Model<SpeciesDocument>,
  ) {
    super(speciesModel);
  }

  async findAllSpecies(): Promise<Species[]> {
    const ret = await this.speciesModel
      .find()
      .select({ id: 1, name: 1 })
      .exec();
    return ret;
  }

  async findOneByName(name: string): Promise<Species> {
    return await this.speciesModel.findOne({ name }).exec();
  }
}
