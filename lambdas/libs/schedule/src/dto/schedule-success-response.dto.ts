import { SuccessResponse } from "@app/common/dto";
import { Schedule } from "@app/schedule";

export class CreateScheduleResponse extends SuccessResponse {
  data: Schedule;
  statusCode = 201;
}

export class GetScheduleResponse extends SuccessResponse {
  data: Schedule;
}

export class GetSchedulesResponse extends SuccessResponse {
  data: Schedule[];
}
