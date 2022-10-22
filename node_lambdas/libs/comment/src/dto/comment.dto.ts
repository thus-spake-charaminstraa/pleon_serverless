import {
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { ApiHideProperty, PartialType, PickType } from '@nestjs/swagger';
import { CommentAuthorKind } from '../types/comment-author-kind.type';

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
