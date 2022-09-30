import { SuccessResponse } from '@app/common/dto';
import { CreateFeedDto } from '@app/feed/dto';
import { Noti } from '@app/noti/entities';
import { ApiProperty, getSchemaPath } from '@nestjs/swagger';

export class GetNotisResponse extends SuccessResponse {
  data: Noti[];
}

export class ManageNotiResponse extends SuccessResponse {
  data: CreateFeedDto | null;
}

export enum NotiViewKind {
  TWO_BTN = 'TWO_BTN',
  ONE_BTN = 'ONE_BTN',
  DEFAULT = 'DEFAULT',
}

export class NotiTwoBtnView {
  viewType: NotiViewKind.TWO_BTN;

  viewObject: Noti;
}

export class NotiOneBtnView {
  viewType: NotiViewKind.ONE_BTN;

  viewObject: {
    content: string;
  };
}

export class NotiDefaultView {
  viewType: NotiViewKind.DEFAULT;

  viewObject: {
    content: string;
  };
}

type ViewObject = NotiTwoBtnView | NotiOneBtnView | NotiDefaultView;

export class GetNotiResponse extends SuccessResponse {
  @ApiProperty({
    type: 'array',
    items: {
      oneOf: [
        {
          type: 'object',
          properties: {
            viewType: {
              type: 'string',
              example: NotiViewKind.TWO_BTN,
            },
            viewObject: {
              $ref: getSchemaPath(Noti),
            },
          },
        },
        {
          type: 'object',
          properties: {
            viewType: {
              type: 'string',
              example: NotiViewKind.ONE_BTN,
            },
            viewObject: {
              type: 'object',
              properties: {
                content: {
                  type: 'string',
                  example: '식물을 등록해주세요!',
                },
              },
            },
          },
        },
        {
          type: 'object',
          properties: {
            viewType: {
              type: 'string',
              example: NotiViewKind.DEFAULT,
            },
            viewObject: {
              type: 'object',
              properties: {
                content: {
                  type: 'string',
                  example: '식물의 하루를 기록해보세요!',
                },
              },
            },
          },
        },
      ],
    },
  })
  data: ViewObject[];
}