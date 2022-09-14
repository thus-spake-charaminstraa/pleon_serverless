import { CommonRepository } from '@app/common/common.repository';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  CreateDeviceTokenDto,
  GetDeviceTokenQuery,
  UpdateDeviceTokenDto,
} from '../dto/device-token.dto';
import {
  DeviceToken,
  DeviceTokenDocument,
} from '../entities/device-token.entity';

@Injectable()
export class DeviceTokenRepository extends CommonRepository<
  DeviceToken,
  CreateDeviceTokenDto,
  UpdateDeviceTokenDto,
  GetDeviceTokenQuery
> {
  constructor(
    @InjectModel(DeviceToken.name)
    private deviceTokenModel: Model<DeviceTokenDocument>,
  ) {
    super(deviceTokenModel);
  }

  async updateTimestampByToken(
    token: string,
    updateDeviceTokenDto: UpdateDeviceTokenDto,
  ) {
    return await this.deviceTokenModel
      .findOneAndUpdate({ device_token: token }, updateDeviceTokenDto, {
        new: true,
      })
      .exec();
  }

  async deleteManyExpired(criteria: Date) {
    return await this.deviceTokenModel.deleteMany({ updated_at: { $lt: criteria } }).exec();
  }
}
