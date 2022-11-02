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
  GetGuideNotiQuery,
  GetNotiQuery,
  NotiManageDto,
  NotiManageKind,
  UpdateNotiDto,
} from './dto/noti.dto';
import { Noti } from './entities/noti.entity';
import { NotiRepository } from './noti.repository';
import { NotiKind } from './types/noti-kind.type';

@Injectable()
export class NotiService extends CommonService<
  Noti,
  CreateNotiDto,
  UpdateNotiDto,
  GetNotiQuery
> {
  private notiContentFormat: (name: string, kind: string) => string;
  private fcmMessaging: Messaging;
  private dryRun = false;

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

  async findAllGuideNoti(query: GetGuideNotiQuery): Promise<Noti[]> {
    query.kinds = [
      NotiKind.water,
      NotiKind.air,
      NotiKind.prune,
      NotiKind.nutrition,
      NotiKind.repot,
      NotiKind.spray,
    ];
    return await this.notiRepository.findAllGuideNoti(query);
  }

  async findAllCommentNotiGroupByDate(
    query: GetNotiQuery,
  ): Promise<any[]> {
    return await this.notiRepository.findAllCommentNotiGroupByDate(query);
  }

  async sendPushNotiToDevice(
    targetDevice: DeviceToken,
    title: string,
    content: string,
  ): Promise<any> {
    const GCMPayload = {
      title,
      body: content,
    };
    const message = {
      token: targetDevice.device_token,
      notification: GCMPayload,
    };
    try {
      return await this.fcmMessaging.send(message, this.dryRun);
    } catch (e) {
      if (e.errorInfo.code === 'messaging/registration-token-not-registered') {
        return await this.deviceTokenRepository.deleteOne(
          targetDevice.id.toString(),
        );
      }
    }
  }

  async sendPushNotiToMultiDevices(
    targetDevices: DeviceToken[],
    title: string,
    content: string,
  ) {
    console.log('send noti');
    const GCMPayload = {
      title,
      body: content,
    };
    const message = {
      tokens: targetDevices.map((device: DeviceToken) => device.device_token),
      notification: GCMPayload,
    };
    try {
      const ret = await this.fcmMessaging.sendMulticast(message, this.dryRun);
      const failedTokenIds = [];
      if (ret.failureCount > 0) {
        ret.responses.forEach((response, index) => {
          if (!response.success) {
            failedTokenIds.push(targetDevices[index].id);
          }
        });
        await this.deviceTokenRepository.deleteMany({ id: failedTokenIds });
      }
      return ret;
    } catch (e) {
      return await this.deviceTokenRepository.deleteMany({
        id: targetDevices.map((device: DeviceToken) => device.id),
      });
    }
  }

  async findNotisByPlantId(plantId: string): Promise<Noti[]> {
    return await this.notiRepository.findNotisByPlantId(plantId);
  }

  async subscribeTopic(
    topic: string,
    targetDeviceOrDevices: DeviceToken | DeviceToken[],
  ): Promise<void> {
    let tokenOrTokens: string | string[];
    if (Array.isArray(targetDeviceOrDevices)) {
      tokenOrTokens = targetDeviceOrDevices.map(
        (device: DeviceToken) => device.device_token,
      );
    } else {
      tokenOrTokens = targetDeviceOrDevices.device_token;
    }
    await this.fcmMessaging.subscribeToTopic(tokenOrTokens, topic);
  }

  async unsubscribeTopic(
    topic: string,
    targetDeviceOrDevices: DeviceToken | DeviceToken[],
  ): Promise<void> {
    let tokenOrTokens: string | string[];
    if (Array.isArray(targetDeviceOrDevices)) {
      tokenOrTokens = targetDeviceOrDevices.map(
        (device: DeviceToken) => device.device_token,
      );
    } else {
      tokenOrTokens = targetDeviceOrDevices.device_token;
    }
    await this.fcmMessaging.unsubscribeFromTopic(tokenOrTokens, topic);
  }

  async sendPushNotiToTopic(
    topic: string,
    title: string,
    content: string,
  ): Promise<any> {
    const GCMPayload = {
      title,
      body: content,
    };
    const message = {
      topic,
      notification: GCMPayload,
    };
    return await this.fcmMessaging.send(message, this.dryRun);
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
