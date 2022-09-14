import { Injectable } from '@nestjs/common';
import { CommonService } from '@app/common';
import { DeviceToken } from '../entities';
import { DeviceTokenRepository } from '../repositories/device-token.repository';
import {
  CreateDeviceTokenDto,
  GetDeviceTokenQuery,
  UpdateDeviceTokenDto,
} from '../dto/device-token.dto';

@Injectable()
export class DeviceTokenService extends CommonService<
  DeviceToken,
  CreateDeviceTokenDto,
  UpdateDeviceTokenDto,
  GetDeviceTokenQuery
> {
  constructor(private readonly deviceTokenRepository: DeviceTokenRepository) {
    super(deviceTokenRepository);
  }

  async create(createDeviceTokenDto: CreateDeviceTokenDto) {
    return await this.deviceTokenRepository.create(createDeviceTokenDto);
  }

  async updateTimestampByToken(
    token: string,
    updateDeviceTokenDto: UpdateDeviceTokenDto,
  ) {
    return await this.deviceTokenRepository.updateTimestampByToken(token, {
      ...updateDeviceTokenDto,
      updated_at: new Date(),
    });
  }

  async deleteManyExpired() {
    const criteria = new Date();
    criteria.setMonth(criteria.getMonth() - 2);
    return await this.deviceTokenRepository.deleteManyExpired(criteria);
  }
}
