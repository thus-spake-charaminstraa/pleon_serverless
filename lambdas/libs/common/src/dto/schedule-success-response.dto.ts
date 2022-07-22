import { Schedule } from "@app/schedule";
import { SuccessResponse } from "./success-response.dto";


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
