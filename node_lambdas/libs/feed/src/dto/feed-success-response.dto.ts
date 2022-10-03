import { Feed } from '@app/feed/entities/feed.entity';
import { Noti } from '@app/noti';
import { Plant } from '@app/plant/entities/plant.entity';
import { ApiProperty, getSchemaPath } from '@nestjs/swagger';
import { CommentRes } from '@app/comment/dto';
import { SuccessResponse } from '@app/common/dto';
import { User } from '@app/user';
import { FeedKind } from '../types/feed-kind.type';

export class CreateFeedResponse extends SuccessResponse {
  data: Feed;
  statusCode = 201;
}

export class GetFeedResponse extends SuccessResponse {
  data: Feed;
}

export class FeedRes extends Feed {
  comment_list: CommentRes[];
  plant: Plant;
  user: User;
}

export class GetFeedCalendarResponse extends SuccessResponse {
  data: GetFeedCalendarRes[];
}

export class GetFeedCalendarRes {
  _id: string;
  timestamp: Date;
  kinds: FeedKind[];
}

export class GetFeedsResponse extends SuccessResponse {
  data: {
    result: FeedView[];
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
              $ref: getSchemaPath(FeedRes),
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
