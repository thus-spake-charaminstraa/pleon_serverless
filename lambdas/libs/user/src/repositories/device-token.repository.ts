import { CommonRepository } from '@app/common/common.repository';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  CreateDeviceTokenDto,
  GetDeviceTokenQuery,
} from '../dto/device-token.dto';
import {
  DeviceToken,
  DeviceTokenDocument,
} from '../entities/device-token.entity';

@Injectable()
export class DeviceTokenRepository extends CommonRepository<
  DeviceToken,
  CreateDeviceTokenDto,
  any,
  GetDeviceTokenQuery
  > {
  constructor(
    @InjectModel(DeviceToken.name) model: Model<DeviceTokenDocument>,
  ) {
    super(model);
  }
}
