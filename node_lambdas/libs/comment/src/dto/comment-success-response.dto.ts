import { SuccessResponse } from '@app/common/dto/success-response.dto';
import { CommentRes } from './comment.dto';

export class CreateCommentResponse extends SuccessResponse {
  data: CommentRes;
  statusCode = 201;
}

export class UpdateCommentResponse extends SuccessResponse {
  data: CommentRes;
}

export class GetCommentResponse extends SuccessResponse {
  data: CommentRes;
}

export class GetCommentsResponse extends SuccessResponse {
  data: CommentRes[];
}
