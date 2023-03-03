import { Injectable } from '@nestjs/common';
import { CommonService } from '@app/common/common.service';
import { DeviceToken } from '../entities/device-token.entity';
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

  async findAllByUserId(userId: string): Promise<DeviceToken[]> {
    return await this.deviceTokenRepository.findAllByUserId(userId);
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

  async deleteDuplicated() {
    const duplicatedList = await this.deviceTokenRepository.findAllDuplicated();
    return await Promise.all(
      duplicatedList.map((duplicated: any) => {
        duplicated.dups.shift();
        return Promise.all(
          duplicated.dups.map((id: string) => {
            this.deviceTokenRepository.deleteOne(id);
          }),
        );
      }),
    );
  }
}
