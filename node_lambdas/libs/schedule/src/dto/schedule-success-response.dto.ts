import { SuccessResponse } from '@app/common/dto/success-response.dto';
import { Plant } from '@app/plant/entities/plant.entity';
import { Schedule } from '../entities/schedule.entity';
import { ScheduleKind } from '../types/schedule-kind.enum';

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
