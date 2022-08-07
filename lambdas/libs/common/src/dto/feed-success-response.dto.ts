import { Feed } from '@app/feed/entities/feed.entity';
import { Noti } from '@app/noti';
import { Plant } from '@app/plant/entities/plant.entity';
import { ApiExtraModels, ApiProperty, getSchemaPath } from '@nestjs/swagger';
import { SuccessResponse } from './success-response.dto';
import { UserSchema } from '../../../user/src/entities/user.entity';
import { FeedByParamsIdInterceptor } from '../interceptors/feedById.interceptor';

export class CreateFeedResponse extends SuccessResponse {
  data: Feed;
  statusCode = 201;
}

export class GetFeedResponse extends SuccessResponse {
  data: Feed;
}

export class FeedRes extends Feed {
  plant: Plant;
}

export class GetFeedsResponse extends SuccessResponse {
  data: {
    result: FeedRes[];
    count: number;
    next_offset: number;
  };
}

export enum FeedViewKind {
  feed = 'feed',
  noti = 'noti',
}

export class FeedView {
  viewType: FeedViewKind;

  viewObject: FeedRes;
}

@ApiExtraModels()
export class NotiView {
  viewType: FeedViewKind;

  viewObject: Noti;
}

type ViewObject = FeedView | NotiView;

class FeedsWithNoti {
  @ApiProperty({
    type: 'array',
    items: {
      oneOf: [
        {
          type: 'object',
          properties: {
            viewType: {
              type: 'string',
              example: 'noti',
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
              example: 'feed',
            },
            viewObject: {
              $ref: getSchemaPath(Feed),
            },
          },
        },
      ],
    },
  })
  result: ViewObject[];

  count: number;

  next_offset: number;
}

export class GetFeedsWithNotiResponse extends SuccessResponse {
  data: FeedsWithNoti;
}

export class UpdateFeedResponse extends SuccessResponse {
  data: Feed;
}
