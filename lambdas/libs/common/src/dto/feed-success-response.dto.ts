import { Feed } from '@app/feed/entities/feed.entity';
import { SuccessResponse } from './success-response.dto';

export class CreateFeedResponse extends SuccessResponse {
  data: Feed;
  statusCode = 201;
}

export class GetFeedResponse extends SuccessResponse {
  data: Feed;
}

export class GetFeedsResponse extends SuccessResponse {
  data: Feed[];
}

export class UpdateFeedResponse extends SuccessResponse {
  data: Feed;
}
