import { CommentRes } from '@app/comment/dto/comment-success-response.dto';
import { SuccessResponse } from '@app/common/dto/success-response.dto';
import { Diagnosis } from '@app/plant/entities/diagnosis.entity';
import { Plant } from '@app/plant/entities/plant.entity';
import { User } from '@app/user/entities/user.entity';
import { ApiProperty, getSchemaPath } from '@nestjs/swagger';
import { Feed } from '../entities/feed.entity';
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
  feed = 'FEED',
  diagnosis = 'DIAGNOSIS',
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
              example: 'DIAGNOSIS',
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
              example: 'FEED',
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
