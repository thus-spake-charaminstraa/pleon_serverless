import { SuccessResponse } from '@app/common/dto/success-response.dto';
import { VerifySmsResDto } from './sms-auth.dto';
import { CreateTokenResDto } from './token.dto';

export class LoginResponse extends SuccessResponse {
  data: CreateTokenResDto;
}

export class VerifySmsResponse extends SuccessResponse {
  data: VerifySmsResDto;
}
