import {
  Inject,
  Injectable,
  forwardRef,
  BadRequestException,
} from '@nestjs/common';
import { FeedService } from '@app/feed/feed.service';
import { PlantService } from './plant.service';
import { plantInfoForGuide } from '@app/common/types/plant-guide.type';
import { ScheduleKind } from '@app/schedule/types/schedule-kind.enum';
import { SpeciesService } from './species.service';
import { NotiService } from '@app/noti/noti.service';
import { NotiKind } from '@app/noti/types/noti-kind.type';
import { GuideManageDto } from '../dto/guide.dto';
import { GuideManageKind } from '../types/guide-manage.type';
import { DateStrFormat } from '@app/common/utils/date-parser';

@Injectable()
export class GuideService {
  private notiContentFormat: (name: string, kind: string) => string;

  constructor(
    @Inject(forwardRef(() => PlantService))
    private readonly plantService: PlantService,
    @Inject(forwardRef(() => FeedService))
    private readonly feedService: FeedService,
    @Inject(forwardRef(() => SpeciesService))
    private readonly speciesService: SpeciesService,
    @Inject(forwardRef(() => NotiService))
    private readonly notiService: NotiService,
  ) {
    this.notiContentFormat = (plantName: string, kind: string) => {
      const contents = {
        water: `${plantName}의 흙이 말라있나요?\n말라있다면 물을 주세요~!`,
        air: `${plantName}이가 신선한 공기를 필요로 해요.\n창문을 열어 환기를 시켜주세요~!`,
        spray: `${plantName} 잎이 바싹 말랐나요?\n${plantName}에게 분무를 해주세요!`,
        repot: `${plantName}의 화분 밑으로 뿌리가 나와있지는 않나요?\n나와있다면 새집으로 이사할 시간이에요.`,
        nutrition: `${plantName} 집에 먹을 것이 없어요..\n화분에 액체 비료를 꽂아주세요.`,
        prune: `${plantName} 머리가 까치집이네요^^\n가지치기를 해주세요!`,
      };
      return contents[kind];
    };
  }

  async getPlantGuide(speciesName: string) {
    const speciesInfo = await this.speciesService.findOneByName(speciesName);
    const ifWinter = new Date().getMonth() >= 11 || new Date().getMonth() <= 2;
    return {
      water: ifWinter
        ? new Date(speciesInfo.proper_watering_winter)
        : new Date(speciesInfo.proper_watering_other),
      air: new Date(2 * 24 * 60 * 60 * 1000),
      repot: ifWinter
        ? new Date(1000 * 24 * 60 * 60 * 1000)
        : new Date(90 * 24 * 60 * 60 * 1000),
      prune: new Date(30 * 24 * 60 * 60 * 1000),
      spray: new Date(3 * 24 * 60 * 60 * 1000),
      nutrition: new Date(30 * 24 * 60 * 60 * 1000),
    };
  }

  async checkScheduleOverdue(plantInfo: plantInfoForGuide): Promise<any> {
    const scheduleOfPlantByKind = await this.feedService.findByPlantAndGroup(
      plantInfo.id.toString(),
    );
    const guide = await this.getPlantGuide(plantInfo.species);
    const ret = {};
    for (const kind of Object.keys(ScheduleKind)) {
      let overdue = false;
      const schedule = scheduleOfPlantByKind[kind];
      if (
        schedule?.length > 0 &&
        schedule[0].created_at.getTime() + guide[kind].getTime() <= Date.now()
      ) {
        overdue = true;
      }
      if (
        (!schedule) &&
        new Date(plantInfo.adopt_date).getTime() + guide[kind].getTime() <=
        Date.now()
      ) {
        overdue = true;
      }
      ret[kind] = overdue;
    }
    return ret;
  }

  async sendNotiForPlant(plantInfo: plantInfoForGuide): Promise<void> {
    const overdue = await this.checkScheduleOverdue(plantInfo);
    for (const kind of Object.keys(NotiKind)) {
      if (overdue[kind]) {
        const notiPromise =
          plantInfo.user?.device_tokens && plantInfo.user.guide_push_noti
            ? this.notiService.sendPushNotiToMultiDevices(
                plantInfo.user.device_tokens,
                'PLeon 관리 가이드',
                this.notiContentFormat(plantInfo.name, kind),
            )
            : Promise.resolve();
        await this.notiService.deleteMany({
          plant_id: plantInfo.id.toString(),
          kind: NotiKind[kind],
        });
        const ret = await Promise.allSettled([
          this.notiService.create({
            owner: plantInfo.owner.toString(),
            plant_id: plantInfo.id.toString(),
            kind: NotiKind[kind],
            content: this.notiContentFormat(plantInfo.name, kind),
          }),
          notiPromise,
        ]);
        console.log(ret);
      }
    }
  }

  async sendNotiForPlants(query: any): Promise<void> {
    const plantInfos = await this.plantService.findAllInfo(query);
    const ret = await Promise.allSettled(
      plantInfos.map((plant) => this.sendNotiForPlant(plant)),
    );
    console.log(ret);
  }

  async completeManage(id: string): Promise<void> {
    const ret = await this.notiService.deleteOne(id);
    const kind: any = ret.kind;
    const feed = await this.feedService.create(
      {
        owner: ret.owner.toString(),
        plant_id: ret.plant_id.toString(),
        publish_date: new Date(DateStrFormat(new Date())),
        kind,
        content: '오늘은 무엇을 해주었어요~?',
      },
      true,
    );
  }

  async laterManage(id: string): Promise<void> {
    await this.notiService.deleteOne(id);
  }

  async guideManage(guideManageDto: GuideManageDto): Promise<void> {
    if (guideManageDto.type === GuideManageKind.complete) {
      return await this.completeManage(guideManageDto.noti_id);
    } else if (guideManageDto.type === GuideManageKind.later) {
      return await this.laterManage(guideManageDto.noti_id);
    } else {
      throw new BadRequestException('guideManageDto.type is invalid');
    }
  }
}
