import { SuccessResponse } from "@app/common/dto";
import { CreateFeedDto } from "@app/feed/dto";
import { Noti } from "@app/noti/entities";

export class GetNotisResponse extends SuccessResponse {
  data: Noti[];
}

export class ManageNotiResponse extends SuccessResponse {
  data: CreateFeedDto | null;
} 

