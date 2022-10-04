import { DateStrFormat } from '@app/common';
import { CommonService } from '@app/common/common.service';
import { FeedKind } from '@app/feed';
import { FeedService } from '@app/feed/feed.service';
import { NotiKind } from '@app/noti';
import { NotiService } from '@app/noti/noti.service';
import {
  BadRequestException,
  ConflictException,
  forwardRef,
  Inject,
  Injectable,
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
    this.plantMoodInfoMap = {
      happy: {
        mood: 'happy',
        icon_uri:
          'https://pleon-image-main.s3.ap-northeast-2.amazonaws.com/icon_happy.png',
      },
      sad: {
        mood: 'sad',
        icon_uri:
          'https://pleon-image-main.s3.ap-northeast-2.amazonaws.com/icon_sad.png',
      },
      sick: {
        mood: 'sick',
        icon_uri:
          'https://pleon-image-main.s3.ap-northeast-2.amazonaws.com/icon_sick.png',
      },
      boring: {
        mood: 'boring',
        icon_uri:
          'https://pleon-image-main.s3.ap-northeast-2.amazonaws.com/icon_boring.png',
      },
      hot: {
        mood: 'hot',
        icon_uri:
          'https://pleon-image-main.s3.ap-northeast-2.amazonaws.com/icon_hot.png',
      },
    };
    this.plantMoodInfos = Object.values(this.plantMoodInfoMap);
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
