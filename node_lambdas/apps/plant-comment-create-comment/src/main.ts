import { NestFactory } from '@nestjs/core';
import { Callback, Context, Handler } from 'aws-lambda';
import { HttpException, INestApplicationContext } from '@nestjs/common';
import { PlantCommentCreateCommentModule } from './plant-comment-create-comment.module';
import { CommentService } from '@app/comment/comment.service';
import { CreateCommentDto } from '@app/comment/dto/comment.dto';
import { CommentAuthorKind } from '@app/comment/types/comment-author-kind.type';

let app: INestApplicationContext;

async function bootstrap() {
  return await NestFactory.createApplicationContext(
    PlantCommentCreateCommentModule,
  );
}

export const handler: Handler = async (
  event: any,
  context: Context,
  callback: Callback,
) => {
  if (!app) {
    app = await bootstrap();
  }
  const commentService = app.get(CommentService);
  try {
    const data = JSON.parse(event.body).data;
    console.log(data);
    const ret = await Promise.all(data.map((commentResponse: any) => {
      const createCommentdto: CreateCommentDto = {
        plant_id: commentResponse.plant_id,
        content: commentResponse.bot_response,
        feed_id: commentResponse.feed_id,
        author_kind: CommentAuthorKind.plant,
      }
      return commentService.create(createCommentdto);
    }));

    return {
      data: ret,
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET,HEAD,PUT,PATCH,POST,DELETE',
      },
      success: true,
    };
  } catch (e) {
    console.log(e);
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
