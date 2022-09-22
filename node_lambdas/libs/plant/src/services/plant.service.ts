import { CommonService } from '@app/common/common.service';
import { FeedKind } from '@app/feed';
import { FeedService } from '@app/feed/feed.service';
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import {
  CreatePlantApiDto,
  CreatePlantDto,
  GetPlantQuery,
  UpdatePlantDto,
} from '../dto';
import { Plant } from '../entities';
import { PlantRepository } from '../repositories/plant.repository';

@Injectable()
export class PlantService extends CommonService<
  Plant,
  CreatePlantDto,
  UpdatePlantDto,
  GetPlantQuery
> {
  constructor(
    private plantRepository: PlantRepository,
    @Inject(forwardRef(() => FeedService))
    private feedService: FeedService,
  ) {
    super(plantRepository);
  }

  async create(createPlantDto: CreatePlantApiDto): Promise<Plant> {
    const ret = await this.plantRepository.create(createPlantDto);
    await Promise.all([
      this.feedService.create({
        owner: ret.owner.toString(),
        plant_id: ret.id.toString(),
        publish_date: new Date(),
        kind: FeedKind.today,
        content: `${ret.name}을 새로 입양했다!`,
      }),
      this.feedService.create(
        {
          owner: ret.owner.toString(),
          plant_id: ret.id.toString(),
          publish_date: new Date(createPlantDto.water_date),
          kind: FeedKind.water,
          content: 'auto',
        },
        true,
      ),
    ]);
    return ret;
  }
}
