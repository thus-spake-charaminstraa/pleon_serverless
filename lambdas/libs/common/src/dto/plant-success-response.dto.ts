import { GetPlantResDto } from "@app/plant";
import { SuccessResponse } from "./success-response.dto";

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
