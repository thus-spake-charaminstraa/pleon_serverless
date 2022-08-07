import { CreateFeedDto } from "@app/feed/dto";
import { Noti } from "@app/noti/entities";
import { SuccessResponse } from "./success-response.dto";

export class GetNotisResponse extends SuccessResponse {
  data: Noti[];
}

export class ManageNotiResponse extends SuccessResponse {
  data: CreateFeedDto | null;
} 

