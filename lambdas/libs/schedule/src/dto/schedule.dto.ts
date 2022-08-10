import { PartialType } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsMongoId } from 'class-validator';
import { ScheduleKind } from '../types';

export class CreateScheduleDto {
  @IsMongoId()
  plant_id: string;

  @IsDateString()
  timestamp: Date;

  @IsEnum(ScheduleKind)
  kind: ScheduleKind;
}

export class UpdateScheduleDto extends PartialType(CreateScheduleDto) {}

export class GetScheduleQuery {
  plant_id: string;
}

export class DeleteScheduleQuery {
  plant_id: string;
}
