import { Injectable } from '@nestjs/common';
import { NotiRepository } from './noti.repository';
import { ScheduleService } from '@app/schedule';
import { NotiKind, plantInfoForGuide } from '@app/common/types';
import { SNSClient } from '@aws-sdk/client-sns';
import { Noti } from './entities';
import { GetNotiQuery } from './dto';
import { PlantRepository } from '@app/plant';
import { CreateFeedDto } from '@app/feed/dto';
import { DateStrFormat } from '@app/common/utils';

const snsClient = new SNSClient({ region: process.env.AWS_REGION });

@Injectable()
export class NotiService {
  constructor(
    private readonly notiRepository: NotiRepository,
    private readonly scheduleService: ScheduleService,
    private readonly plantRepository: PlantRepository,
  ) {}

  async sendNotiForPlant(plantInfo: plantInfoForGuide): Promise<void> {
    const overdue = await this.scheduleService.checkScheduleOverdue(plantInfo);
    for (let kind of Object.keys(NotiKind)) {
      if (overdue[kind]) {
        console.log('water noti sent');
        await this.notiRepository.create({
          owner: plantInfo.owner.toString(),
          plant_id: plantInfo.id.toString(),
          kind: NotiKind.water,
          content: `${plantInfo.name}의 흙이 말라있나요? 말라있다면 물을 주세요~!`,
        })
        // aws sns publish
      }
    }
  }

  async sendNotiForPlants(): Promise<void> {
    const plantInfos = await this.plantRepository.findAllInfo();
    for (let plant of plantInfos) {
      await this.sendNotiForPlant(plant);
    }
  }

  async findAll(query: GetNotiQuery): Promise<Noti[]> {
    return await this.notiRepository.findAll(query);
  }

  async completeManage(id: string): Promise<CreateFeedDto> {
    const ret = await this.notiRepository.deleteOne(id);
    const kind: any = ret.kind;
    const createFeedDto: CreateFeedDto = {
      plant_id: ret.plant_id.toString(),
      publish_date: new Date(),
      kind,
      content: '오늘은 무엇을 해주었어요~?',
    }
    return createFeedDto;
  }

  async laterManage(id: string): Promise<void> {
    await this.notiRepository.deleteOne(id);
  }
}
