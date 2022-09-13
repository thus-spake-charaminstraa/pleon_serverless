import {
  Injectable,
  BadRequestException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { NotiRepository } from './noti.repository';
import { ScheduleService } from '@app/schedule';
import { plantInfoForGuide } from '@app/common/types';
import { Noti } from './entities';
import {
  CreateNotiDto,
  GetNotiQuery,
  NotiManageDto,
  NotiManageKind,
} from './dto';
import { PlantRepository } from '@app/plant';
import { CreateFeedDto } from '@app/feed/dto';
import { NotiKind } from './types';
import { initializeApp } from 'firebase-admin/app';
import { credential } from 'firebase-admin';
import { getMessaging, Messaging } from 'firebase-admin/messaging';

@Injectable()
export class NotiService {
  private notiContentFormat: (name: string, kind: string) => string;
  private fcmMessaging: Messaging;

  constructor(
    private readonly notiRepository: NotiRepository,
    private readonly scheduleService: ScheduleService,
    @Inject(forwardRef(() => PlantRepository))
    private readonly plantRepository: PlantRepository,
  ) {
    this.notiContentFormat = (plantName: string, kind: string) => {
      const contents = {
        water: `${plantName}의 흙이 말라있나요? 말라있다면 물을 주세요~!`,
        air: `${plantName}이가 신선한 공기를 필요로 해요. 창문을 열어 환기를 시켜주세요~!`,
        spray: `${plantName} 잎이 바싹 말랐나요? ${plantName}에게 분무를 해주세요!`,
        repot: `화분 밑으로 뿌리가 나와있지는 않나요? 나와있다면 새집으로 이사할 시간이에요.`,
        fertilize: `${plantName} 집에 먹을 것이 없어요.. 화분에 액체 비료를 꽂아주세요.`,
        prune: `${plantName} 머리가 까치집이네요 ^^ 가지치기를 해주세요!`,
      };
      return contents[kind];
    };
    initializeApp({
      credential: credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      }),
    });
    this.fcmMessaging = getMessaging();
  }

  async sendPushNoti(content: string, targetDevice: string): Promise<any> {
    const GCMPayload = {
      title: 'PLeon 관리 가이드',
      body: content,
    };
    const message = {
      token: targetDevice,
      notification: GCMPayload,
    };
    return this.fcmMessaging.send(message);
  }

  async sendNotiForPlant(plantInfo: plantInfoForGuide): Promise<void> {
    const overdue = await this.scheduleService.checkScheduleOverdue(plantInfo);
    for (let kind of Object.keys(NotiKind)) {
      if (overdue[kind]) {
        await Promise.all([
          this.notiRepository.create({
            owner: plantInfo.owner.toString(),
            plant_id: plantInfo.id.toString(),
            kind: NotiKind.water,
            content: this.notiContentFormat(plantInfo.name, kind),
          }),
          ...plantInfo.user.device_tokens.map((device) =>
            this.sendPushNoti(
              this.notiContentFormat(plantInfo.name, kind),
              device.device_token,
            ),
          ),
        ]);
      }
    }
  }

  async sendNotiForPlants(): Promise<void> {
    const plantInfos = await this.plantRepository.findAllInfo();
    await Promise.all(plantInfos.map((plant) => this.sendNotiForPlant(plant)));
  }

  async create(createNotiDto: CreateNotiDto): Promise<Noti> {
    return await this.notiRepository.create(createNotiDto);
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
    };
    return createFeedDto;
  }

  async laterManage(id: string): Promise<void> {
    await this.notiRepository.deleteOne(id);
  }

  async notiManage(
    id: string,
    notiManageDto: NotiManageDto,
  ): Promise<CreateFeedDto | void> {
    if (notiManageDto.type === NotiManageKind.complete) {
      return await this.completeManage(id);
    } else if (notiManageDto.type === NotiManageKind.later) {
      return await this.laterManage(id);
    } else {
      throw new BadRequestException('notiManageDto.type is invalid');
    }
  }
}
