import { Feed } from '@app/feed/entities/feed.entity';
import { Plant } from '@app/plant/entities/plant.entity';
import { Comment } from '@app/comment/entities/comment.entity';
import { ApiHideProperty, PartialType } from '@nestjs/swagger';
import {
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { Noti } from '../entities/noti.entity';
import { NotiKind } from '../types/noti-kind.type';

export class CreateNotiDto {
  @ApiHideProperty()
  @IsOptional()
  @IsMongoId()
  owner: string;

  @IsMongoId()
  @IsOptional()
  plant_id?: string;

  @IsMongoId()
  @IsOptional()
  feed_id?: string;

  @IsMongoId()
  @IsOptional()
  comment_id?: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsEnum(NotiKind)
  kind: NotiKind;
}

export class UpdateNotiDto extends PartialType(CreateNotiDto) {}

export enum NotiManageKind {
  complete = 'complete',
  later = 'later',
}

export enum NotiListKind {
  DATE = 'DATE',
  IMAGE = 'IMAGE',
  TEXT = 'TEXT',
}

export class NotiRes extends Noti {
  feed: Feed;

  comment: Comment;

  plant: Plant;

  feedContent?: string;

  feedImageUrl?: string;
}

export class NotiManageDto {
  @IsEnum(NotiManageKind)
  type: NotiManageKind;
}

export class GetNotiQuery {
  owner?: string;

  plant_id?: string;

  kind?: NotiKind;
}

export class GetGuideNotiQuery {
  owner?: string;

  plant_id?: string;

  kinds?: NotiKind[];

  kind?: any;
}

export class DeleteNotiQuery {
  owner?: string;

  plant_id?: string;

  kind?: NotiKind;
}
