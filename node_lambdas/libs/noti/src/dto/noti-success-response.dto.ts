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
  twoBtn = 'twoBtn',
  oneBtn = 'oneBtn',
  default = 'default',
}

export class NotiTwoBtnView {
  viewType: NotiViewKind.twoBtn;

  viewObject: Noti;
}

export class NotiOneBtnView {
  viewType: NotiViewKind.oneBtn;

  viewObject: {
    content: string;
  };
}

export class NotiDefaultView {
  viewType: NotiViewKind.default;

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
              example: NotiViewKind.twoBtn,
            },
            viewObject: {
              $ref: getSchemaPath(Noti),
            }
          }
        }, 
        {
          type: 'object',
          properties: {
            viewType: {
              type: 'string',
              example: NotiViewKind.oneBtn,
            },
            viewObject: {
              type: 'object',
              properties: {
                content: {
                  type: 'string',
                  example: '식물과 대화해보세요~!',
                }
              }
            }
          }
        },
        {
          type: 'object',
          properties: {
            viewType: {
              type: 'string',
              example: NotiViewKind.default,
            },
            viewObject: {
              type: 'object',
              properties: {
                content: {
                  type: 'string',
                  example: '식물 육성 일기를 작성해보세요.',
                }
              }
            }
          }
        }
      ]
    }
  })
  data: ViewObject[];
}