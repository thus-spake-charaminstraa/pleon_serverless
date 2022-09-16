import { SuccessResponse } from '@app/common/dto';
import { Plant } from '@app/plant';
import { Schedule, ScheduleKind } from '@app/schedule';

export class CreateScheduleResponse extends SuccessResponse {
  data: Schedule;
  statusCode = 201;
}

export class GetScheduleResponse extends SuccessResponse {
  data: Schedule;
}

export class GetSchedulesResponse extends SuccessResponse {
  data: GetScheduleRes[];
}

export class GetScheduleRes {
  _id: string;
  timestamp: Date;
  kinds: ScheduleKind[];
}

export class ScheduleRes extends Schedule {
  plant: Plant;
}
