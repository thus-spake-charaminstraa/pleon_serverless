import { NestFactory } from '@nestjs/core';
import { Callback, Context, Handler } from 'aws-lambda';
import { HttpException, INestApplicationContext } from '@nestjs/common';
import { PlantCommentGetFeedModule } from './plant-comment-get-feed.module';
import { FeedService } from '@app/feed/feed.service';

let app: INestApplicationContext;

async function bootstrap() {
  return await NestFactory.createApplicationContext(PlantCommentGetFeedModule);
}

export const handler: Handler = async (
  event: any,
  context: Context,
  callback: Callback,
) => {
  if (!app) {
    app = await bootstrap();
  }
  const feedService = app.get(FeedService);
  try {
    const body = JSON.parse(event.body);
    let feeds;
    console.log(body);
    if (body.owner) {
      feeds = await feedService.findAllNotCommented({ owner: body.owner });
    }
    else feeds = await feedService.findAllNotCommented({});
    
    return {
      data: feeds,
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET,HEAD,PUT,PATCH,POST,DELETE',
      },
      success: feeds.length > 0,
    };
  } catch (e) {
    let statusCode = e instanceof HttpException ? e.getStatus() : 500;
    const error =
      e instanceof HttpException
        ? e.getResponse()
        : { message: 'Internal server error' };
    return {
      error,
      statusCode,
      headers: {
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET,HEAD,PUT,PATCH,POST,DELETE',
      },
      success: false,
    };
  }
};
