import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { FeedService } from '@app/feed/feed.service';
import { PlantService } from './plant.service';
import { plantInfoForGuide } from '@app/common/types/plant-guide.type';
import { ScheduleKind } from '@app/schedule/types/schedule-kind.enum';
import { SpeciesService } from './species.service';
import { NotiService } from '@app/noti/noti.service';
import { NotiKind } from '@app/noti/types/noti-kind.type';

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
        repot: `화분 밑으로 뿌리가 나와있지는 않나요?\n나와있다면 새집으로 이사할 시간이에요.`,
        nutrition: `${plantName} 집에 먹을 것이 없어요..\n화분에 액체 비료를 꽂아주세요.`,
        prune: `${plantName} 머리가 까치집이네요^^\n가지치기를 해주세요!`,
      };
      return contents[kind];
    };
  }

  getPlantGuide(species: any): any {
    return {
      water: new Date(7 * 24 * 60 * 60 * 1000),
      air: new Date(2 * 24 * 60 * 60 * 1000),
      repot: new Date(90 * 24 * 60 * 60 * 1000),
      prune: new Date(30 * 24 * 60 * 60 * 1000),
      spray: new Date(3 * 24 * 60 * 60 * 1000),
      nutrition: new Date(30 * 24 * 60 * 60 * 1000),
    };
  }

  async checkScheduleOverdue(plantInfo: plantInfoForGuide): Promise<any> {
    const scheduleOfPlantByKind = await this.feedService.findByPlantAndGroup(
      plantInfo.id.toString(),
    );
    const guide = this.getPlantGuide(plantInfo.species);
    const ret = {};
    for (const kind of Object.keys(ScheduleKind)) {
      let overdue = false;
      const schedule = scheduleOfPlantByKind[kind];
      if (
        schedule?.length > 0 &&
        schedule[0].created_at.getTime() + guide[kind].getTime() <= Date.now()
      ) {
        overdue = true;
      } else if (
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
        const notiProms = plantInfo.user?.device_tokens
          ? plantInfo.user.device_tokens.map((device) =>
              this.notiService.sendPushNoti(
                this.notiContentFormat(plantInfo.name, kind),
                device,
              ),
            )
          : [Promise.resolve(undefined)];
        await this.notiService.deleteMany({
          plant_id: plantInfo.id.toString(),
          kind: NotiKind[kind],
        });
        const ret = await Promise.all([
          this.notiService.create({
            owner: plantInfo.owner.toString(),
            plant_id: plantInfo.id.toString(),
            kind: NotiKind[kind],
            content: this.notiContentFormat(plantInfo.name, kind),
          }),
          ...notiProms,
        ]);
      }
    }
  }

  async sendNotiForPlants(): Promise<void> {
    const plantInfos = await this.plantService.findAllInfo();
    const ret = await Promise.all(
      plantInfos.map((plant) => this.sendNotiForPlant(plant)),
    );
  }
}
