import { IsMongoId } from 'class-validator';
import { Diagnosis } from '../entities/diagnosis.entity';
import { Plant } from '../entities/plant.entity';
import { Cause, Symptom } from '../types/plant-doctor.type';

export class CreateDiagnosisDto {
  @IsMongoId()
  owner: string;

  @IsMongoId()
  plant_id: string;

  symptoms: Symptom[];

  causes: Cause[];

  image_urls: string[];
}

export class GetDiagnosisQuery {
  owner: string;

  plant_id: string;
}

export class DiagnosisRes extends Diagnosis {
  plant: Plant;
}
