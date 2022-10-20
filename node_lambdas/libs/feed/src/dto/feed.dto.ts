import { ApiHideProperty, PartialType, PickType } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { FeedKind } from '../types';

export class CreateFeedDto {
  @ApiHideProperty()
  @IsOptional()
  @IsMongoId()
  owner?: string;

  @IsMongoId()
  plant_id: string;

  @IsDateString()
  publish_date: Date;

  @ApiHideProperty()
  @IsOptional()
  @IsMongoId()
  schedule_id?: string;

  @IsEnum(FeedKind)
  kind: FeedKind;

  @IsNotEmpty()
  @IsString()
  content: string;

  @IsOptional()
  @IsNotEmpty()
  @IsString()
  image_url?: string;
}

export class UpdateFeedDto extends PartialType(
  PickType(CreateFeedDto, ['content', 'image_url', 'publish_date'] as const),
) {}

export class GetFeedAndDiagnosisQuery {
  owner?: string;

  plant_id?: string;

  publish_date?: Date;

  kind?: FeedKind;

  limit: number;

  offset: number;

  order_by: GetFeedOrderBy;

  start?: Date;

  end?: Date;

  created_at?: any;
}

export class GetFeedCalendarQuery {
  plant_id?: string;

  year?: number;

  month?: number;

  start?: Date;

  end?: Date;
}

export class DeleteFeedQuery {
  owner?: string;

  plant_id?: string;

  publish_date?: string;

  kind?: FeedKind;
}

export enum GetFeedOrderBy {
  ASC = 'asc',
  DESC = 'desc',
}
