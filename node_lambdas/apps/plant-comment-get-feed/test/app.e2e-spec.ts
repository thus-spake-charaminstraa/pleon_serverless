import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { PlantCommentGetFeedModule } from './../src/plant-comment-get-feed.module';

describe('PlantCommentGetFeedController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [PlantCommentGetFeedModule],
    }).compile();
  });
});
