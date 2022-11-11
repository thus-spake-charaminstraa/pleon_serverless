import { NestFactory } from '@nestjs/core';
import { Callback, Context, Handler } from 'aws-lambda';
import { INestApplicationContext } from '@nestjs/common';
import { CommentNoticeLambdaModule } from './comment-notice-lambda.module';
import { DeviceTokenService } from '@app/user/services/device-token.service';
import { UserService } from '@app/user/services/user.service';
import { NotiService } from '@app/noti/noti.service';
import { GetUserDto } from '@app/user/dto/user.dto';

let app: INestApplicationContext;

async function bootstrap() {
  return await NestFactory.createApplicationContext(CommentNoticeLambdaModule);
}

export const handler: Handler = async (
  event: any,
  context: Context,
  callback: Callback,
) => {
  if (!app) {
    app = await bootstrap();
  }
  const deviceTokenService = app.get(DeviceTokenService);
  const userService = app.get(UserService);
  const notiService = app.get(NotiService);

  const users = await userService.findAll();
  await deviceTokenService.deleteDuplicated();
  let isNewComment: any = users.map(() => ({ value: true }));
  console.log(!event.all);
  if (!event.all) {
    isNewComment = await Promise.allSettled(
      users.map((user: GetUserDto) => {
        return notiService.checkNotConfirmedCommentNotiExist({
          owner: user.id.toString(),
        });
      }),
    );
  }
  console.log(isNewComment);
  const ret = await Promise.allSettled(
    users.map((user: GetUserDto, idx: number) => {
      return isNewComment[idx]?.value
        ? notiService.sendPushNotiToMultiDevices(
            user.device_tokens,
            '식물과 대화해보세요!',
            '식집사님의 피드에 식물의 댓글이 달렸어요! 댓글을 확인 후 답글을 달면 식물과 대화할 수 있어요 :)',
          )
        : Promise.resolve();
    }),
  );
  console.log(ret);
  return ret;
};
