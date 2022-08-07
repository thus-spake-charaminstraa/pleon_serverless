import { CreateUserResDto, User } from "@app/user";
import { SuccessResponse } from "./success-response.dto";


export class GetUserResponse extends SuccessResponse {
  data: User;
}

export class CreateUserResponse extends SuccessResponse {
  data: CreateUserResDto;
}

export class UpdateUserResponse extends SuccessResponse {
  data: User;
}
