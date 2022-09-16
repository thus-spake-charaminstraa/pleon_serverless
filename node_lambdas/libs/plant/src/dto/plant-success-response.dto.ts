import { SuccessResponse } from '@app/common/dto';
import { GetPlantResDto } from '@app/plant';
import { Species } from '../entities/species.entity';

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
