import { Test, TestingModule } from '@nestjs/testing';
import { AuthLambdaController } from './auth-lambda.controller';
import { AuthLambdaService } from './auth-lambda.service';

describe('AuthLambdaController', () => {
  let authLambdaController: AuthLambdaController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AuthLambdaController],
      providers: [AuthLambdaService],
    }).compile();

    authLambdaController = app.get<AuthLambdaController>(AuthLambdaController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(authLambdaController.getHello()).toBe('Hello World!');
    });
  });
});
