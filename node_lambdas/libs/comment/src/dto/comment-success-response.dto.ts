import { SuccessResponse } from '@app/common/dto/success-response.dto';
import { Plant } from '@app/plant/entities/plant.entity';
import { User } from '@app/user/entities/user.entity';
import { Comment } from '../entities/comment.entity';

export class CreateCommentResponse extends SuccessResponse {
  data: CommentRes;
  statusCode = 201;
}

export class UpdateCommentResponse extends SuccessResponse {
  data: CommentRes;
}

export class CommentRes extends Comment {
  plant: Plant;

  user: User;
}

export class GetCommentResponse extends SuccessResponse {
  data: CommentRes;
}

export class GetCommentsResponse extends SuccessResponse {
  data: CommentRes[];
}
