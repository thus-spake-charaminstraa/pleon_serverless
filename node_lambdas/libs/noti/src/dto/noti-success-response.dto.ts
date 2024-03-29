import { SuccessResponse } from '@app/common/dto/success-response.dto';
import { CreateFeedDto } from '@app/feed/dto/feed.dto';
import { Noti } from '@app/noti/entities/noti.entity';
import { ApiProperty, getSchemaPath } from '@nestjs/swagger';
import { NotiModal } from '../resources/noti-modal';
import { NotiListKind, NotiRes } from './noti.dto';

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

export class GetNotiInFeedResponse extends SuccessResponse {
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

export class GetNotiInListResponse extends SuccessResponse {
  @ApiProperty({
    type: 'array',
    items: {
      oneOf: [
        {
          type: 'object',
          properties: {
            viewType: {
              type: 'string',
              example: NotiListKind.DATE,
            },
            viewObject: {
              type: 'object',
              properties: {
                text: {
                  type: 'string',
                  example: '2022.10.31',
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
              example: NotiListKind.IMAGE,
            },
            viewObject: {
              $ref: getSchemaPath(NotiRes),
            },
          },
        },
        {
          type: 'object',
          properties: {
            viewType: {
              type: 'string',
              example: NotiListKind.TEXT,
            },
            viewObject: {
              $ref: getSchemaPath(NotiRes),
            },
          },
        },
      ],
    },
  })
  data: any[];
}

export class GetFeedModalNotiResponse extends SuccessResponse {
  @ApiProperty({
    type: 'object',
    properties: {
      isExist: {
        type: 'boolean',
        example: true,
      },
      notices: {
        type: 'array',
        items: {
          $ref: getSchemaPath(NotiModal),
        },
        example: [
          {
            name: 'event',
            title: '이벤트',
            content:
              '"#이벤트" 를 태그하고 식물과 찍은 셀카를 올려주시면 추첨을 통해 3명에게 "스타벅스 아메리카노"를 드립니다.\n~11월 22일까지',
            button: true,
            image_url:
              'https://pleon-image-main.s3.ap-northeast-2.amazonaws.com/event_resource_image.png',
          },
        ],
      },
    },
  })
  data: any[];
}

export class GetIfNotConfirmedCommentNotiExist extends SuccessResponse {
  data = true;
}
