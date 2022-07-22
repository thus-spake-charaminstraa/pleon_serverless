import {
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthRepository } from './auth.repository';
import {
  PublishCommand,
  SetSMSAttributesCommand,
  SNSClient,
} from '@aws-sdk/client-sns';
import { VerifySmsDto, SendSmsDto, VerifySmsResDto } from './dto/sms-auth.dto';
import { User } from '@app/user';
import { JwtService } from '@nestjs/jwt';
import { v4 as uuid4 } from 'uuid';
import { CreateTokenResDto } from './dto/token.dto';
import { UserRepository } from '@app/user';

const snsClient = new SNSClient({ region: 'ap-northeast-1' });

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly authRepository: AuthRepository,
  ) { }

  async login(user: User): Promise<CreateTokenResDto> {
    const uuid = uuid4();
    const payload = { uuid, sub: user.id };
    const access_token = this.jwtService.sign(payload);
    const expiresIn = parseInt(
      this.configService.get<string>('JWT_REFRESH_EXPIRES_IN'),
    );
    const refresh_token = this.jwtService.sign(payload, { expiresIn });
    this.authRepository.save(uuid, refresh_token, expiresIn);
    return {
      access_token,
      refresh_token,
    };
  }

  async refresh(user: any): Promise<CreateTokenResDto> {
    const savedToken = await this.authRepository.find(user.uuid);
    if (!savedToken) {
      throw new UnauthorizedException();
    }
    await this.authRepository.delete(user.uuid);
    return this.login(user);
  }

  async logout(user: any): Promise<void> {
    await this.authRepository.delete(user.uuid);
  }

  async sendSms(sendSmsDto: SendSmsDto): Promise<void> {
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
    const result = await snsClient.send(new PublishCommand(params));
    if (result.$metadata.httpStatusCode >= 400) {
      throw new InternalServerErrorException('SMS 전송에 실패했습니다.');
    }
  }

  async verifySms(verifySmsDto: VerifySmsDto): Promise<VerifySmsResDto> {
    const savedCode = await this.authRepository.find(verifySmsDto.phone);
    if (
      verifySmsDto.code !== '777777' && // TODO: remove this line: bypass sms auth
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

  private generateAuthCode(): string {
    return Math.random().toString(10).substring(2, 8);
  }
}
