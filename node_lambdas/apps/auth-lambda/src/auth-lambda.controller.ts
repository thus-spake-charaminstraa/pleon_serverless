import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
  Get,
} from '@nestjs/common';
import { AuthService } from '@app/auth';
import {
  SendSmsDto,
  VerifySmsDto,
  VerifySmsResDto,
  CreateTokenResDto,
  RefreshTokenDto,
  JwtAuthGuard,
  RefreshJwtAuthGuard,
} from '@app/auth';
import { PhonePipe } from '@app/common';

@Controller()
export class AuthLambdaController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Req() req): Promise<CreateTokenResDto> {
    return await this.authService.login(req.user);
  }

  @UseGuards(RefreshJwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post('refresh')
  async refresh(
    @Body() _refreshTokenDto: RefreshTokenDto,
    @Req() req,
  ): Promise<CreateTokenResDto> {
    return await this.authService.refresh(req.user);
  }

  @HttpCode(HttpStatus.OK)
  @Post('send-sms')
  async sendSms(@Body(PhonePipe) sendSmsDto: SendSmsDto): Promise<any> {
    return await this.authService.sendSms(sendSmsDto);
  }

  @HttpCode(HttpStatus.OK)
  @Post('verify-sms')
  async verifySms(
    @Body(PhonePipe) verifySmsDto: VerifySmsDto,
  ): Promise<VerifySmsResDto> {
    return await this.authService.verifySms(verifySmsDto);
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Get('me')
  async me(@Req() req): Promise<any> {
    return req.user;
  }
}
