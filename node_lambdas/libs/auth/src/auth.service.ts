import {
  forwardRef,
  Inject,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthRepository } from './auth.repository';
import { PublishCommand, SNSClient } from '@aws-sdk/client-sns';
import {
  VerifySmsDto,
  SendSmsDto,
  VerifyAuthResDto,
  VerifyKakaoDto,
} from './dto/sms-auth.dto';
import { User } from '@app/user/entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import { v4 as uuid4 } from 'uuid';
import { CreateTokenResDto } from './dto/token.dto';
import { UserRepository } from '@app/user/repositories/user.repository';
import { HttpService } from '@nestjs/axios';
import { parsePhoneNumber } from 'libphonenumber-js';

@Injectable()
export class AuthService {
  constructor(
    @Inject(forwardRef(() => UserRepository))
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly authRepository: AuthRepository,
    private readonly httpService: HttpService,
    @Inject('SNS_CLIENT') private readonly snsClient?: SNSClient,
  ) {}

  async login(user: User): Promise<CreateTokenResDto> {
    const uuid = uuid4();
    const payload = { uuid, sub: user.id };
    const access_token = this.jwtService.sign(payload);
    const expiresIn = parseInt(
      this.configService.get<string>('JWT_REFRESH_EXPIRES_IN'),
    );
    const refresh_token = this.jwtService.sign(payload, { expiresIn });
    this.authRepository.save(uuid, refresh_token, expiresIn);
    const token = {
      access_token,
      refresh_token,
    };
    return {
      user,
      token,
    };
  }

  async refresh(user: any): Promise<CreateTokenResDto> {
    const savedToken = await this.authRepository.find(user.uuid);
    if (!savedToken) {
      throw new UnauthorizedException('리프레시 토큰이 만료되었습니다.');
    }
    await this.authRepository.deleteOne(user.uuid);
    return this.login(user);
  }

  async logout(user: any): Promise<void> {
    await this.authRepository.deleteOne(user.uuid);
  }

  async sendSms(sendSmsDto: SendSmsDto): Promise<any> {
    const code = this.generateAuthCode();
    await this.authRepository.save(
      sendSmsDto.phone,
      code,
      this.configService.get<number>('PHONE_AUTH_EXPIRES_IN'),
    );
    const params = {
      Message: 'Your verification code is ' + code,
      PhoneNumber: sendSmsDto.phone,
    };
    const result = await this.snsClient.send(new PublishCommand(params));
    if (result.$metadata.httpStatusCode >= 400) {
      throw new InternalServerErrorException('SMS 전송에 실패했습니다.');
    }
    return result;
  }

  async verifySms(verifySmsDto: VerifySmsDto): Promise<VerifyAuthResDto> {
    const savedCode = await this.authRepository.find(verifySmsDto.phone);
    if (
      verifySmsDto.code !== '777777' && // TODO: remove this line: bypass sms auth
      !(
        verifySmsDto.code === '999999' &&
        verifySmsDto.phone ===
          parsePhoneNumber('010-9999-9999', 'KR').format('E.164')
      ) && // TODO: remove this line: bypass sms auth
      (!savedCode || savedCode !== verifySmsDto.code)
    ) {
      throw new UnauthorizedException();
    }
    const existUser = await this.userRepository.findByPhone(verifySmsDto.phone);
    const sub = !!existUser ? existUser.id : verifySmsDto.phone;
    return {
      isExist: !!existUser,
      verify_token: this.jwtService.sign({ sub }),
    };
  }

  async verifyKakao(verifyKakaoDto: VerifyKakaoDto): Promise<VerifyAuthResDto> {
    const kakaoRes: any = (
      await this.httpService.axiosRef.get('https://kapi.kakao.com/v2/user/me', {
        headers: {
          Authorization: `Bearer ${verifyKakaoDto.access_token}`,
        },
      })
    ).data;
    console.log(kakaoRes);
    const kakaoId = kakaoRes.id;
    const existUser = await this.userRepository.findByKakaoId(kakaoId);
    const sub = !!existUser ? existUser.id : kakaoId;
    return {
      isExist: !!existUser,
      verify_token: this.jwtService.sign({ sub }),
    };
  }

  private generateAuthCode(): string {
    return Math.random().toString(10).substring(2, 8);
  }
}
