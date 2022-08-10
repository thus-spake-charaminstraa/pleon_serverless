import { Comment } from '@app/comment/entities';
import { SuccessResponse } from '@app/common/dto';
import { Plant } from '@app/plant';
import { User } from '@app/user';

export class CreateCommentResponse extends SuccessResponse {
  data: CommentRes;
  statusCode = 201;
}

export class UpdateCommentResponse extends SuccessResponse {
  data: CommentRes;
}

class CommentRes extends Comment {
  plant: Plant;

  user: User;
}

export class GetCommentResponse extends SuccessResponse {
  data: CommentRes;
}

export class GetCommentsResponse extends SuccessResponse {
  data: CommentRes[];
}
