import { Test } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthRepository } from './auth.repository';
import { UserRepository } from '@app/user/repositories/user.repository';
import { HttpService } from '@nestjs/axios';
import { User } from '@app/user/entities/user.entity';
import {
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { SendSmsDto, VerifyAuthResDto, VerifySmsDto } from './dto/sms-auth.dto';
import { v4 as uuid4 } from 'uuid';

jest.mock('uuid', () => ({
  v4: jest.fn(),
}));

describe('AuthService', () => {
  let authService: AuthService;
  let userRepository: UserRepository;
  let jwtService: JwtService;
  let configService: ConfigService;
  let authRepository: AuthRepository;

  const sendSmsDto: SendSmsDto = {
    phone: '01012345678',
  };

  // const verifySmsDto: VerifySmsDto = {
  //   phone: '01012345678',
  //   code: '123456',
  // };

  const snsClient = {
    send: jest.fn(() => Promise.resolve(null)),
  };

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UserRepository,
          useValue: {
            findOne: jest.fn(),
            findByPhone: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: (key) => {
              if (key == 'JWT_REFRESH_EXPIRES_IN') return '1000';
              else return 1000;
            },
          },
        },
        {
          provide: AuthRepository,
          useValue: {
            find: jest.fn(),
            deleteOne: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: HttpService,
          useValue: {},
        },
        {
          provide: 'SNS_CLIENT',
          useValue: snsClient,
        },
      ],
    }).compile();

    authService = moduleRef.get<AuthService>(AuthService);
    userRepository = moduleRef.get<UserRepository>(UserRepository);
    jwtService = moduleRef.get<JwtService>(JwtService);
    configService = moduleRef.get<ConfigService>(ConfigService);
    authRepository = moduleRef.get<AuthRepository>(AuthRepository);
  });

  describe('login', () => {
    const user = new User();

    it('should return a CreateTokenResDto with access and refresh tokens', async () => {
      const uuid = '12345';
      const payload = { uuid, sub: user.id };
      const access_token = 'access_token';
      const expiresIn = 1000;
      const refresh_token = 'refresh_token';

      jest.mocked(uuid4).mockImplementation(() => uuid);
      jest.spyOn(jwtService, 'sign').mockImplementationOnce(() => access_token);
      jest
        .spyOn(jwtService, 'sign')
        .mockImplementationOnce(() => refresh_token);
      jest.spyOn(configService, 'get').mockReturnValue(expiresIn);
      jest
        .spyOn(authRepository, 'save')
        .mockImplementation(() => Promise.resolve());

      const result = await authService.login(user);

      expect(result.user).toEqual(user);
      expect(result.token).toEqual({ access_token, refresh_token });
      expect(uuid4).toHaveBeenCalled();
      expect(jwtService.sign).toHaveBeenCalledWith(payload);
      expect(jwtService.sign).toHaveBeenCalledWith(payload, { expiresIn });
      expect(configService.get).toHaveBeenCalledWith('JWT_REFRESH_EXPIRES_IN');
      expect(authRepository.save).toHaveBeenCalledWith(
        uuid,
        refresh_token,
        expiresIn,
      );
    });
  });

  describe('refresh', () => {
    it('should refresh the access token', async () => {
      const mockUser = { uuid: '123', id: '456', ...new User() };
      const mockSavedToken = 'refresh_token';
      const mockAccessToken = 'access_token';
      const mockExpiresIn = 60 * 60 * 24 * 7; // 7 days
      const mockRefreshToken = 'refresh_token';
      const mockToken = {
        access_token: mockAccessToken,
        refresh_token: mockRefreshToken,
      };
      const mockCreateTokenResDto = {
        user: mockUser,
        token: mockToken,
      };

      jest.spyOn(authRepository, 'find').mockResolvedValue(mockSavedToken);
      jest.spyOn(jwtService, 'sign').mockReturnValueOnce(mockAccessToken);
      jest.spyOn(jwtService, 'sign').mockReturnValueOnce(mockRefreshToken);
      jest.spyOn(configService, 'get').mockReturnValue(mockExpiresIn);
      jest.spyOn(authService, 'login').mockResolvedValue(mockCreateTokenResDto);

      const result = await authService.refresh(mockUser);

      expect(authRepository.find).toHaveBeenCalledWith(mockUser.uuid);
      expect(authRepository.deleteOne).toHaveBeenCalledWith(mockUser.uuid);
      expect(authService.login).toHaveBeenCalledWith(mockUser);
      expect(result).toEqual(mockCreateTokenResDto);
    });

    it('should throw an UnauthorizedException when the refresh token is not found', async () => {
      const mockUser = { uuid: '123', id: '456' };
      jest.spyOn(authRepository, 'find').mockReturnValue(undefined);
      jest.spyOn(authService, 'login').mockResolvedValue(undefined);

      await expect(authService.refresh(mockUser)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(authRepository.find).toHaveBeenCalledWith(mockUser.uuid);
      expect(authRepository.deleteOne).not.toHaveBeenCalled();
      expect(authService.login).not.toHaveBeenCalled();
    });
  });

  describe('logout', () => {
    it('should delete the refresh token from the repository', async () => {
      const mockUser = { uuid: '123', id: '456' };
      await authService.logout(mockUser);
      expect(authRepository.deleteOne).toHaveBeenCalledWith(mockUser.uuid);
    });
  });

  describe('sendSms', () => {
    it('should send a verification code to a phone number and return the result', async () => {
      const authRepositorySaveSpy = jest
        .spyOn(authRepository, 'save')
        .mockResolvedValue(undefined);
      const snsClientSendSpy = jest.spyOn(snsClient, 'send').mockResolvedValue({
        $metadata: { httpStatusCode: 200 },
      });

      const result = await authService.sendSms(sendSmsDto);

      expect(authRepositorySaveSpy).toHaveBeenCalledWith(
        sendSmsDto.phone,
        expect.any(String),
        expect.any(Number),
      );
      expect(snsClientSendSpy).toHaveBeenCalledWith(expect.any(Object));
      expect(result).toBeDefined();
    });

    it('should throw an InternalServerErrorException if sending SMS fails', async () => {
      jest.spyOn(authRepository, 'save').mockResolvedValue(undefined);
      jest.spyOn(snsClient, 'send').mockResolvedValue({
        $metadata: { httpStatusCode: 500 },
      });

      await expect(authService.sendSms(sendSmsDto)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('verifySms', () => {
    const phone = '01012345678';
    const code = '123456';
    const verifySmsDto: VerifySmsDto = { phone, code };

    it('should throw an UnauthorizedException if the verification code is invalid', async () => {
      jest.spyOn(authRepository, 'find').mockResolvedValue(null);

      await expect(authService.verifySms(verifySmsDto)).rejects.toThrowError(
        UnauthorizedException,
      );
    });

    it('should throw an UnauthorizedException if the verification code does not match', async () => {
      jest.spyOn(authRepository, 'find').mockResolvedValue('wrong-code');

      await expect(authService.verifySms(verifySmsDto)).rejects.toThrowError(
        UnauthorizedException,
      );
    });

    it('should return a VerifyAuthResDto with isExist true and a signed JWT token if the verification code is valid and the user exists', async () => {
      const user = { ...new User(), phone };
      jest.spyOn(authRepository, 'find').mockResolvedValue(code);
      jest.spyOn(userRepository, 'findByPhone').mockResolvedValue(user);
      jest.spyOn(jwtService, 'sign').mockReturnValue('jwt-token');

      const expectedResponse: VerifyAuthResDto = {
        isExist: true,
        verify_token: 'jwt-token',
      };
      const result = await authService.verifySms(verifySmsDto);

      expect(result).toEqual(expectedResponse);
      expect(authRepository.find).toHaveBeenCalledWith(phone);
      expect(userRepository.findByPhone).toHaveBeenCalledWith(phone);
      expect(jwtService.sign).toHaveBeenCalledWith({ sub: user.id });
    });

    it('should return a VerifyAuthResDto with isExist false and a signed JWT token if the verification code is valid and the user does not exist', async () => {
      jest.spyOn(authRepository, 'find').mockResolvedValue(code);
      jest.spyOn(userRepository, 'findByPhone').mockResolvedValue(null);
      jest.spyOn(jwtService, 'sign').mockReturnValue('jwt-token');

      const expectedResponse: VerifyAuthResDto = {
        isExist: false,
        verify_token: 'jwt-token',
      };
      const result = await authService.verifySms(verifySmsDto);

      expect(result).toEqual(expectedResponse);
      expect(authRepository.find).toHaveBeenCalledWith(phone);
      expect(userRepository.findByPhone).toHaveBeenCalledWith(phone);
      expect(jwtService.sign).toHaveBeenCalledWith({ sub: phone });
    });
  });
});
