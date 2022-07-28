import { ScheduleKind } from "@app/common/types";
import { IsDate, IsDateString, IsEnum, IsMongoId } from "class-validator";

export class CreateScheduleDto {
  @IsMongoId()
  plant_id: string;

  @IsDateString()
  timestamp: Date;

  @IsEnum(ScheduleKind)
  kind: ScheduleKind;
}