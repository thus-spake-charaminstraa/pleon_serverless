import { User, CreateUserResDto } from "@app/user";
import {
  CreateTokenResDto,
  VerifySmsResDto,
} from '@app/auth';
import { Plant } from "@app/plant";

export class SuccessResponse {
  success = true;
  statusCode = 200;
}

// export class UploadImageResponse extends SuccessResponse {
//   data: imageUploadResDto;
//   statusCode = 201;
// }

export class GetUserResponse extends SuccessResponse {
  data: User;
}

export class CreateUserResponse extends SuccessResponse {
  data: CreateUserResDto;
}

export class LoginResponse extends SuccessResponse {
  data: CreateTokenResDto;
}

export class VerifySmsResponse extends SuccessResponse {
  data: VerifySmsResDto;
}


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
