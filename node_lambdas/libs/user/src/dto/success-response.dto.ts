import { SuccessResponse } from '@app/common/dto/success-response.dto';
import { DeviceToken } from '../entities/device-token.entity';
import { User } from '../entities/user.entity';
import { CreateUserResDto } from './user.dto';

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
