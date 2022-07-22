import { Plant } from "@app/plant";
import { SuccessResponse } from "./success-response.dto";

export class GetPlantResponse extends SuccessResponse {
  data: Plant;
}

export class GetPlantsResponse extends SuccessResponse {
  data: Plant[];
}

export class CreatePlantResponse extends SuccessResponse {
  data: Plant;
  statusCode = 201;
}

export class UpdatePlantResponse extends SuccessResponse {
  data: Plant;
}
