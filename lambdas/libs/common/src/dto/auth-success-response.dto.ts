import { CreateTokenResDto, VerifySmsResDto } from "@app/auth";
import { SuccessResponse } from "./success-response.dto";

export class LoginResponse extends SuccessResponse {
  data: CreateTokenResDto;
}

export class VerifySmsResponse extends SuccessResponse {
  data: VerifySmsResDto;
}
