import {
  JwtCheckStrategy,
  JwtStrategy,
  RefreshJwtStrategy,
} from './jwt.strategy';
import { UserRepository } from '@app/user/repositories/user.repository';
import { UnauthorizedException } from '@nestjs/common';
import { User } from '@app/user/entities/user.entity';
import { Schema } from 'mongoose';

describe('JwtStrategy', () => {
  let jwtStrategy: JwtStrategy;
  let userRepository: UserRepository;
  let configService: any;

  beforeEach(() => {
    userRepository = new UserRepository({} as any);
    configService = {
      get: jest.fn().mockReturnValue('test'),
    };
    jwtStrategy = new JwtStrategy(userRepository, configService);
  });

  describe('validate', () => {
    it('should return a user when a valid payload is provided', async () => {
      const mockUser = { ...new User(), username: 'testuser' };
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser);

      const payload = { sub: 1 };
      const result = await jwtStrategy.validate(payload);

      expect(result).toEqual(mockUser);
      expect(userRepository.findOne).toHaveBeenCalledWith(payload.sub);
    });

    it('should throw an UnauthorizedException when an invalid payload is provided', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(undefined);

      const payload = { sub: 1 };
      await expect(jwtStrategy.validate(payload)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});

describe('JwtCheckStrategy', () => {
  let jwtCheckStrategy: JwtCheckStrategy;
  let configService: any;

  beforeEach(() => {
    configService = {
      get: jest.fn().mockReturnValue('test'),
    };
    jwtCheckStrategy = new JwtCheckStrategy(configService);
  });

  describe('validate', () => {
    it('should return the payload when a valid payload is provided', async () => {
      const payload = { sub: 1 };
      const result = await jwtCheckStrategy.validate(payload);

      expect(result).toEqual(payload);
    });
  });
});

describe('RefreshJwtStrategy', () => {
  let refreshJwtStrategy: RefreshJwtStrategy;
  let userRepository: UserRepository;
  let configService: any;

  beforeEach(() => {
    userRepository = new UserRepository({} as any);
    configService = {
      get: jest.fn().mockReturnValue('test'),
    };
    refreshJwtStrategy = new RefreshJwtStrategy(userRepository, configService);
  });

  describe('validate', () => {
    it('should return the user with uuid when a valid payload is provided', async () => {
      const mockUser = {
        ...new User(),
        id: new Schema.Types.ObjectId(''),
        username: 'testuser',
      };
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser);

      const payload = { sub: mockUser.id, uuid: 'uuid123' };
      const result = await refreshJwtStrategy.validate(payload);

      expect(result).toEqual({ ...mockUser, uuid: 'uuid123' });
      expect(userRepository.findOne).toHaveBeenCalledWith(payload.sub);
    });

    it('should throw an UnauthorizedException when an invalid payload is provided', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(undefined);

      const payload = { sub: 1, uuid: 'uuid123' };
      await expect(refreshJwtStrategy.validate(payload)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
