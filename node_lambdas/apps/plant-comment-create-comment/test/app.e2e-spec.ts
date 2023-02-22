import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { PlantCommentCreateCommentModule } from './../src/plant-comment-create-comment.module';

describe('PlantCommentCreateCommentController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [PlantCommentCreateCommentModule],
    }).compile();
  });
});
