import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { MonolithicAppModule } from './../src/monolithic-app.module';

describe('MonolithicAppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [MonolithicAppModule],
    }).compile();
  });
});
