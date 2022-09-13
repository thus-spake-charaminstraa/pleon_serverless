import { Injectable } from '@nestjs/common';
import { CommonService } from '@app/common';
import { DeviceToken } from '../entities';
import { DeviceTokenRepository } from '../repositories/device-token.repository';
import {
  CreateDeviceTokenDto,
  GetDeviceTokenQuery,
} from '../dto/device-token.dto';

@Injectable()
export class DeviceTokenService extends CommonService<
  DeviceToken,
  CreateDeviceTokenDto,
  any,
  GetDeviceTokenQuery
  > {
  constructor(private readonly deviceTokenRepository: DeviceTokenRepository) {
    super(deviceTokenRepository);
  }

  async create(createDeviceTokenDto: CreateDeviceTokenDto) {
    return await this.deviceTokenRepository.create(createDeviceTokenDto);
  }
}
