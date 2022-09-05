import { Injectable } from '@nestjs/common';
import { CommonService } from '@app/common';
import { DeviceToken } from '../entities';
import { DeviceTokenRepository } from '../repositories/device-token.repository';
import {
  CreateDeviceTokenDto,
  GetDeviceTokenQuery,
} from '../dto/device-token.dto';
import { CreatePlatformEndpointCommand, SNSClient } from '@aws-sdk/client-sns';

const snsClient = new SNSClient({ region: process.env.AWS_REGION });

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
    const platformEndpointARN = await snsClient.send(
      new CreatePlatformEndpointCommand({
        PlatformApplicationArn:
          process.env.AWS_SNS_AOS_PLATFORM_APPLICATION_ARN,
        Token: createDeviceTokenDto.device_token,
      }),
    );
    console.log(platformEndpointARN);
    createDeviceTokenDto.device_token = platformEndpointARN.EndpointArn;

    return await this.deviceTokenRepository.create(createDeviceTokenDto);
  }
}
