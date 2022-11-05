import { AuthService } from '@app/auth/auth.service';
import {
  LoginResponse,
  VerifySmsResponse,
} from '@app/auth/dto/auth-success-response.dto';
import {
  SendSmsDto,
  VerifySmsDto,
  VerifyAuthResDto,
  VerifyKakaoDto,
} from '@app/auth/dto/sms-auth.dto';
import { CreateTokenResDto, RefreshTokenDto } from '@app/auth/dto/token.dto';
import {
  JwtAuthGuard,
  RefreshJwtAuthGuard,
} from '@app/auth/guards/jwt-auth.guard';
import {
  BadRequestResponse,
  UnauthorizedResponse,
} from '@app/common/dto/error-response.dto';
import { SuccessResponse } from '@app/common/dto/success-response.dto';
import { PhonePipe } from '@app/common/pipes/phone.pipe';
import { GetUserResponse } from '@app/user/dto/success-response.dto';
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiHeader,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('auth')
export class AuthLambdaController {
  constructor(private readonly authService: AuthService) {}

  /**
   * send sms, verity sms 의 결과로 주어진 토큰의 유효성을 확인하고,
   * id로 사용자를 찾아서 access_token과 refresh_token을 반환합니다.
   */
  @ApiUnauthorizedResponse({
    description: '유효하지 않은 verify token입니다.',
    type: UnauthorizedResponse,
  })
  @ApiOkResponse({
    description: '로그인을 성공합니다.',
    type: LoginResponse,
  })
  @ApiHeader({
    name: 'Authorization',
    description:
      'Bearer token으로 /auth/verify-sms에서 받은 token을 전달합니다.',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Req() req): Promise<CreateTokenResDto> {
    return await this.authService.login(req.user);
  }

  /**
   * 요청 바디로 보내주는 리프레시 토큰으로 토큰을 재발급합니다.
   */
  @ApiOkResponse({
    description: '토큰을 재발급합니다.',
    type: LoginResponse,
  })
  @ApiUnauthorizedResponse({
    description: '유효하지 않은 refresh token입니다.',
    type: UnauthorizedResponse,
  })
  @UseGuards(RefreshJwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post('refresh')
  async refresh(
    @Body() _refreshTokenDto: RefreshTokenDto,
    @Req() req,
  ): Promise<CreateTokenResDto> {
    return await this.authService.refresh(req.user);
  }

  /**
   * sms 인증 코드를 주어진 휴대폰 번호로 발송합니다. 기한은 3분입니다.
   */
  @ApiOkResponse({
    description: '인증 코드 sms 발송 성공',
    type: SuccessResponse,
  })
  @ApiBadRequestResponse({
    type: BadRequestResponse,
    description: '유효하지 않은 휴대폰 번호입니다.',
  })
  @HttpCode(HttpStatus.OK)
  @Post('send-sms')
  async sendSms(@Body(PhonePipe) sendSmsDto: SendSmsDto): Promise<any> {
    return await this.authService.sendSms(sendSmsDto);
  }

  /**
   * 주어진 휴대폰 번호와 주어진 코드를 검증합니다. 이때 인증 코드는 인증 코드 발송 시간에 따라 유효기간이 지나면 삭제됩니다.
   * 인증 코드 검증이 성공하면 인증 토큰을 반환합니다.
   */
  @ApiOkResponse({
    type: VerifySmsResponse,
    description: 'sms 메시지 인증 성공',
  })
  @ApiBadRequestResponse({
    type: BadRequestResponse,
    description: '유효하지 않은 휴대폰 번호입니다.',
  })
  @ApiUnauthorizedResponse({
    type: UnauthorizedResponse,
    description: '인증 코드가 일치하지 않습니다.',
  })
  @HttpCode(HttpStatus.OK)
  @Post('verify-sms')
  async verifySms(
    @Body(PhonePipe) verifySmsDto: VerifySmsDto,
  ): Promise<VerifyAuthResDto> {
    return await this.authService.verifySms(verifySmsDto);
  }

  /**
   * 주어진 카카오 액세스 토큰을 검증합니다. 
   * 카카오 토큰 검증이 성공하면 인증 토큰을 반환합니다.
   */
  @ApiOkResponse({
    type: VerifySmsResponse,
    description: '카카오 인증 성공',
  })
  @ApiUnauthorizedResponse({
    type: UnauthorizedResponse,
    description: '인증 토큰이 일치하지 않습니다.',
  })
  @HttpCode(HttpStatus.OK)
  @Post('verify-kakao')
  async verifyKakao(
    @Body() verifyKakaoDto: VerifyKakaoDto,
  ): Promise<VerifyAuthResDto> {
    return await this.authService.verifyKakao(verifyKakaoDto);
  }

  /**
   * splash api로, 유저의 정보를 얻어온다. 이때 인증 토큰을 통해서 유저의 정보를 얻어올 수 있다.
   */
  @ApiOkResponse({
    type: GetUserResponse,
    description: '유저 정보 조회 성공',
  })
  @ApiUnauthorizedResponse({
    description: '유효하지 않은 access token입니다.',
    type: UnauthorizedResponse,
  })
  @ApiHeader({
    name: 'Authorization',
    description: 'Bearer token으로 access token을 전달합니다.',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Get('me')
  async me(@Req() req): Promise<any> {
    return req.user;
  }
}
