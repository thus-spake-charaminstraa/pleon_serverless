import { NestFactory } from '@nestjs/core';
import { Callback, Context, Handler } from 'aws-lambda';
import { INestApplicationContext } from '@nestjs/common';
import { EventLambdaModule } from './event-notice-lambda.module';
import { UserService } from '@app/user/services/user.service';
import { NotiService } from '@app/noti/noti.service';
import { DeviceTokenService } from '@app/user/services/device-token.service';
import { GetUserDto } from '@app/user/dto/user.dto';

let app: INestApplicationContext;

async function bootstrap() {
  return await NestFactory.createApplicationContext(EventLambdaModule);
}

export const handler: Handler = async (
  event: any,
  context: Context,
  callback: Callback,
) => {
  if (!app) {
    app = await bootstrap();
  }

  const userService = app.get(UserService);
  const notiService = app.get(NotiService);
  const deviceTokenService = app.get(DeviceTokenService);

  const users = await userService.findAll();
  await deviceTokenService.deleteDuplicated();
  const ret = await Promise.allSettled(
    users.map((user: GetUserDto) => {
      return notiService.sendPushNotiToMultiDevices(
        user.device_tokens,
        '식물 셀카 이벤트 진행중!',
        '식물과 셀카를 찍고 #이벤트로 피드 게시물을 올려주세요! 추첨을 통해 커피를 드립니다 :)',
      );
    }),
  );
  console.log(ret);
  return ret;
};
