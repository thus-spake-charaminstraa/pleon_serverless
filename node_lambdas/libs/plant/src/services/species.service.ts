import { Injectable } from '@nestjs/common';
import { CreateSpeciesDto } from '../dto/species.dto';
import { CommonService } from '@app/common/common.service';
import { SpeciesRepository } from '../repositories/species.repository';
import { Species } from '../entities/species.entity';

@Injectable()
export class SpeciesService extends CommonService<
  Species,
  CreateSpeciesDto,
  any,
  any
> {
  constructor(private readonly speciesRepository: SpeciesRepository) {
    super(speciesRepository);
  }

  async findAllSpecies(): Promise<Species[]> {
    return await this.speciesRepository.findAllSpecies();
  }

  async findOneByName(name: string) {
    return await this.speciesRepository.findOneByName(name);
  }
}
