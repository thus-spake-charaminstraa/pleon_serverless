import { CommonService } from '@app/common/common.service';
import { DeviceToken } from '@app/user/entities/device-token.entity';
import { DeviceTokenRepository } from '@app/user/repositories/device-token.repository';
import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
} from '@nestjs/common';
import { credential } from 'firebase-admin';
import { initializeApp } from 'firebase-admin/app';
import { getMessaging, Messaging } from 'firebase-admin/messaging';
import {
  CreateNotiDto,
  GetNotiQuery,
  NotiManageDto,
  NotiManageKind,
  UpdateNotiDto,
} from './dto/noti.dto';
import { Noti } from './entities/noti.entity';
import { NotiRepository } from './noti.repository';

@Injectable()
export class NotiService extends CommonService<
  Noti,
  CreateNotiDto,
  UpdateNotiDto,
  any
> {
  private notiContentFormat: (name: string, kind: string) => string;
  private fcmMessaging: Messaging;

  constructor(
    private readonly notiRepository: NotiRepository,
    @Inject(forwardRef(() => DeviceTokenRepository))
    private readonly deviceTokenRepository: DeviceTokenRepository,
  ) {
    super(notiRepository);
    initializeApp({
      credential: credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      }),
    });
    this.fcmMessaging = getMessaging();
  }

  async sendPushNoti(content: string, targetDevice: DeviceToken): Promise<any> {
    const GCMPayload = {
      title: 'PLeon 관리 가이드',
      body: content,
    };
    const message = {
      token: targetDevice.device_token,
      notification: GCMPayload,
    };
    try {
      return await this.fcmMessaging.send(message);
    } catch (e) {
      if (e.errorInfo.code === 'messaging/registration-token-not-registered') {
        return await this.deviceTokenRepository.deleteOne(
          targetDevice.id.toString(),
        );
      }
    }
  }

  async findNotisByPlantId(plantId: string): Promise<Noti[]> {
    return await this.notiRepository.findNotisByPlantId(plantId);
  }

  async completeManage(id: string): Promise<void> {
    const ret = await this.notiRepository.deleteOne(id);
    const kind: any = ret.kind;
    // const feed = await this.feedService.create(
    //   {
    //     owner: ret.owner.toString(),
    //     plant_id: ret.plant_id.toString(),
    //     publish_date: new Date(DateStrFormat(new Date())),
    //     kind,
    //     content: '오늘은 무엇을 해주었어요~?',
    //   },
    //   true,
    // );
  }

  async laterManage(id: string): Promise<void> {
    await this.notiRepository.deleteOne(id);
  }

  async notiManage(id: string, notiManageDto: NotiManageDto): Promise<void> {
    if (notiManageDto.type === NotiManageKind.complete) {
      return await this.completeManage(id);
    } else if (notiManageDto.type === NotiManageKind.later) {
      return await this.laterManage(id);
    } else {
      throw new BadRequestException('notiManageDto.type is invalid');
    }
  }
}
