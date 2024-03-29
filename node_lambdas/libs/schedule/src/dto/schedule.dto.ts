import { PartialType } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsMongoId } from 'class-validator';
import { ScheduleKind } from '../types/schedule-kind.enum';

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
  plant_id?: string;

  year?: number;

  month?: number;

  start?: Date;

  end?: Date;
}

export class DeleteScheduleQuery {
  plant_id: string;
}
