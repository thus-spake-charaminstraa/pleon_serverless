import { SuccessResponse } from '@app/common/dto';
import { CreateUserResDto, DeviceToken, User } from '@app/user';

export class GetUserResponse extends SuccessResponse {
  data: User;
}

export class CreateUserResponse extends SuccessResponse {
  data: CreateUserResDto;
}

export class UpdateUserResponse extends SuccessResponse {
  data: User;
}

export class CreateDeviceTokenResponse extends SuccessResponse {
  data: DeviceToken;
}

export class UpdateDeviceTokenResponse extends SuccessResponse {
  data: DeviceToken;
}
