import { SuccessResponse } from '@app/common/dto/success-response.dto';
import { Species } from '../entities/species.entity';
import { DiagnosisRes } from './diagnosis.dto';
import { GetPlantResDto } from './plant.dto';

export class GetPlantResponse extends SuccessResponse {
  data: GetPlantResDto;
}

export class GetPlantsResponse extends SuccessResponse {
  data: GetPlantResDto[];
}

export class CreatePlantResponse extends SuccessResponse {
  data: GetPlantResDto;
  statusCode = 201;
}

export class UpdatePlantResponse extends SuccessResponse {
  data: GetPlantResDto;
}

export class GetSpeciesResponse extends SuccessResponse {
  data: Species[];
}

export class GetDiagnosisResponse extends SuccessResponse {
  data: DiagnosisRes;
}

export class GetDiagnosesResponse extends SuccessResponse {
  data: DiagnosisRes[];
}
