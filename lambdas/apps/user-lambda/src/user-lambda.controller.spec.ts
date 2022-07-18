import { Test, TestingModule } from '@nestjs/testing';
import { UserLambdaController } from './user-lambda.controller';
import { UserLambdaService } from './user-lambda.service';

describe('UserLambdaController', () => {
  let userLambdaController: UserLambdaController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [UserLambdaController],
      providers: [UserLambdaService],
    }).compile();

    userLambdaController = app.get<UserLambdaController>(UserLambdaController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(userLambdaController.getHello()).toBe('Hello World!');
    });
  });
});
