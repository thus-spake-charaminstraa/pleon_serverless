import { IsPhoneNumber, IsString } from 'class-validator';

export class SendSmsDto {
  @IsPhoneNumber('KR')
  phone: string;
}

export class VerifySmsDto {
  @IsPhoneNumber('KR')
  phone: string;

  @IsString()
  code: string;
}

export class VerifyKakaoDto {
  @IsString()
  access_token: string;
}

export class VerifyAuthResDto {
  isExist: boolean;
  verify_token: string;
}
