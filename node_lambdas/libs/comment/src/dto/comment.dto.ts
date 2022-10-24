import {
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { ApiHideProperty, PartialType, PickType } from '@nestjs/swagger';
import { CommentAuthorKind } from '../types/comment-author-kind.type';
import { Plant } from '@app/plant/entities/plant.entity';
import { User } from '@app/user/entities/user.entity';
import { Comment } from '../entities/comment.entity';
import { Feed } from '@app/feed/entities/feed.entity';

export class CreateCommentDto {
  @IsMongoId()
  feed_id: string;

  @ApiHideProperty()
  @IsOptional()
  @IsMongoId()
  user_id: string;

  @IsOptional()
  @IsMongoId()
  plant_id: string;

  @IsEnum(CommentAuthorKind)
  author_kind: CommentAuthorKind;

  @IsNotEmpty()
  @IsString()
  content: string;
}

export class UpdateCommentDto extends PartialType(
  PickType(CreateCommentDto, ['content'] as const),
) {}

export class GetCommentQuery {
  feed_id: string;

  user_id: string;

  plant_id: string;

  author_kind: CommentAuthorKind;
}

export class DeleteCommentQuery {
  feed_id: string;

  user_id: string;

  plant_id: string;

  author_kind: CommentAuthorKind;
}

export class CommentRes extends Comment {
  plant: Plant;

  user: User;

  feed: Feed;
}
