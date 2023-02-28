import { CACHE_MANAGER } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Cache } from 'cache-manager';
import { AuthRepository } from './auth.repository';

describe('AuthRepository', () => {
  let repository: AuthRepository;
  let cacheManager: Cache;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthRepository,
        {
          provide: CACHE_MANAGER,
          useValue: {
            set: jest.fn(),
            get: jest.fn(),
            del: jest.fn(),
            reset: jest.fn(),
          },
        },
      ],
    }).compile();

    repository = module.get<AuthRepository>(AuthRepository);
    cacheManager = module.get<Cache>(CACHE_MANAGER);
  });

  describe('save', () => {
    it('should call cacheManager.set with correct arguments', async () => {
      const uuid = 'test_uuid';
      const token = 'test_token';
      const ttl = 60;

      await repository.save(uuid, token, ttl);

      expect(cacheManager.set).toHaveBeenCalledWith(uuid, token, { ttl });
    });
  });

  describe('find', () => {
    it('should call cacheManager.get with correct arguments', async () => {
      jest.spyOn(cacheManager, 'get').mockResolvedValue('test_token');

      const uuid = 'test_uuid';
      const token = 'test_token';
      const ttl = 60;
      await repository.save(uuid, token, ttl);

      expect(await repository.find(uuid)).toBe('test_token');

      expect(cacheManager.get).toHaveBeenCalledWith(uuid);
    });
  });

  describe('deleteOne', () => {
    it('should call cacheManager.del with correct arguments', async () => {
      const uuid = 'test_uuid';

      await repository.deleteOne(uuid);

      expect(cacheManager.del).toHaveBeenCalledWith(uuid);
    });
  });

  describe('reset', () => {
    it('should call cacheManager.reset', async () => {
      await repository.reset();

      expect(cacheManager.reset).toHaveBeenCalled();
    });
  });
});
