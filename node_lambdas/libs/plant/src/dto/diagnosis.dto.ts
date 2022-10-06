import { IsMongoId } from "class-validator";
import { Cause, Symptom } from '../types/plant-doctor.type';

export class CreateDiagnosisDto {
  @IsMongoId()
  plant_id: string;

  symptom: Symptom;

  cause: Cause;
}


