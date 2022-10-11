import { Feed } from '@app/feed/entities/feed.entity';
import { Noti } from '@app/noti';
import { Plant } from '@app/plant/entities/plant.entity';
import { ApiProperty, getSchemaPath } from '@nestjs/swagger';
import { CommentRes } from '@app/comment/dto';
import { SuccessResponse } from '@app/common/dto';
import { User } from '@app/user';
import { FeedKind } from '../types/feed-kind.type';
import { Diagnosis } from '@app/plant/entities/diagnosis.entity';

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
  diagnosis = 'diagnosis',
}

export class FeedView {
  viewType: FeedViewKind;

  viewObject: FeedRes;
}

export class DiagnosisView {
  viewType: FeedViewKind;

  viewObject: Diagnosis;
}

type ViewObject = FeedView | DiagnosisView;

class FeedsWithOtherStuffs {
  @ApiProperty({
    type: 'array',
    items: {
      oneOf: [
        {
          type: 'object',
          properties: {
            viewType: {
              type: 'string',
              example: 'diagnosis',
            },
            viewObject: {
              $ref: getSchemaPath(Diagnosis),
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

export class GetFeedsWithOtherResponse extends SuccessResponse {
  data: FeedsWithOtherStuffs;
}

export class UpdateFeedResponse extends SuccessResponse {
  data: Feed;
}
