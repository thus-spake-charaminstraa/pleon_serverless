import { SuccessResponse } from "@app/common/dto";
import { CreateUserResDto, User } from "@app/user";

export class GetUserResponse extends SuccessResponse {
  data: User;
}

export class CreateUserResponse extends SuccessResponse {
  data: CreateUserResDto;
}

export class UpdateUserResponse extends SuccessResponse {
  data: User;
}
