import { Feed } from '@app/feed/entities/feed.entity';
import { Plant } from '@app/plant/entities/plant.entity';
import { SuccessResponse } from './success-response.dto';

export class CreateFeedResponse extends SuccessResponse {
  data: Feed;
  statusCode = 201;
}

export class GetFeedResponse extends SuccessResponse {
  data: Feed;
}

export class GetFeedsResponse extends SuccessResponse {
  data: {
    result: FeedRes[];
    count: number;
    next_offset: number;
  };
}

class FeedRes extends Feed {
  plant: Plant;
}

export class UpdateFeedResponse extends SuccessResponse {
  data: Feed;
}
