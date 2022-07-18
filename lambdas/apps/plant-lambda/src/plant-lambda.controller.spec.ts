import { Test, TestingModule } from '@nestjs/testing';
import { PlantLambdaController } from './plant-lambda.controller';
import { PlantService } from '@app/plant';

describe('PlantLambdaController', () => {
  let plantLambdaController: PlantLambdaController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [PlantLambdaController],
      providers: [PlantService],
    }).compile();

    plantLambdaController = app.get<PlantLambdaController>(PlantLambdaController);
  });

});
