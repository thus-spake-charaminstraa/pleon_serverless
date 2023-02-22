import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { PlantDoctorAnalysisModule } from './../src/plant-doctor-analysis.module';

describe('PlantDoctorAnalysisController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [PlantDoctorAnalysisModule],
    }).compile();
  });
});
