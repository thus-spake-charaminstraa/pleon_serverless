import { DateStrFormat } from '@app/common';
import { CommonService } from '@app/common/common.service';
import { FeedKind } from '@app/feed';
import { FeedService } from '@app/feed/feed.service';
import { NotiKind } from '@app/noti';
import { NotiService } from '@app/noti/noti.service';
import {
  ConflictException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  CreatePlantApiDto,
  CreatePlantDto,
  GetPlantQuery,
  GetPlantResDto,
  UpdatePlantDto,
} from '../dto';
import { Plant } from '../entities';
import { PlantRepository } from '../repositories/plant.repository';
import { PlantMoodInfoMap, PlantMoodInfos } from '../resources/plant-mood';

@Injectable()
export class PlantService extends CommonService<
  Plant,
  CreatePlantDto,
  UpdatePlantDto,
  GetPlantQuery
> {
  plantMoodInfos: any[];
  plantMoodInfoMap: any;
  constructor(
    private plantRepository: PlantRepository,
    @Inject(forwardRef(() => FeedService))
    private feedService: FeedService,
    @Inject(forwardRef(() => NotiService))
    private notiService: NotiService,
  ) {
    super(plantRepository);
    this.plantMoodInfoMap = PlantMoodInfoMap;
    this.plantMoodInfos = PlantMoodInfos;
  }

  async getPlantMoodInfos() {
    return this.plantMoodInfos;
  }

  async create(createPlantDto: CreatePlantApiDto): Promise<Plant> {
    const plants = await this.plantRepository.findAll({
      owner: createPlantDto.owner,
    });
    if (plants.length >= 6) {
      throw new ConflictException('You can only have 6 plants.');
    }
    const ret = await this.plantRepository.create(createPlantDto);
    await Promise.all([
      this.feedService.create({
        owner: ret.owner.toString(),
        plant_id: ret.id.toString(),
        publish_date: new Date(DateStrFormat(new Date())),
        kind: FeedKind.today,
        content: `${ret.name}을 새로 입양했다!`,
      }),
      this.feedService.create(
        {
          owner: ret.owner.toString(),
          plant_id: ret.id.toString(),
          publish_date: new Date(
            DateStrFormat(new Date(createPlantDto.water_date)),
          ),
          kind: FeedKind.water,
          content: 'auto',
        },
        true,
      ),
    ]);
    return ret;
  }

  async findAll(query: GetPlantQuery): Promise<GetPlantResDto[]> {
    const plants = await this.plantRepository.findAll(query);
    const notis = await Promise.all(
      plants.map((plant) => {
        return this.notiService.findNotisByPlantId(plant.id.toString());
      }),
    );
    const ret = plants.map((plant: GetPlantResDto, idx: number) => {
      const plantNoti = notis[idx];
      if (plantNoti.some((noti) => noti.kind === NotiKind.water)) {
        plant.mood = this.plantMoodInfoMap.sad;
      } else if (plantNoti.some((noti) => noti.kind === NotiKind.air)) {
        plant.mood = this.plantMoodInfoMap.hot;
      } else {
        plant.mood = this.plantMoodInfoMap.happy;
      }
      return plant;
    });
    return ret;
  }

  async findOne(id: string): Promise<GetPlantResDto> {
    const plant = await this.plantRepository.findOne(id);
    if (!plant) {
      throw new NotFoundException('Plant not found');
    }
    const notis = await this.notiService.findNotisByPlantId(id);
    if (notis.some((noti) => noti.kind === NotiKind.water)) {
      plant.mood = this.plantMoodInfoMap.sad;
    } else if (notis.some((noti) => noti.kind === NotiKind.air)) {
      plant.mood = this.plantMoodInfoMap.hot;
    } else {
      plant.mood = this.plantMoodInfoMap.happy;
    }
    return plant as GetPlantResDto;
  }
}
