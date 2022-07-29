import { FeedKind } from "@app/common/types";
import { ApiHideProperty, PartialType } from "@nestjs/swagger";
import { IsDateString, IsEnum, IsMongoId, IsOptional, IsString } from "class-validator";

export class CreateFeedDto {
  @ApiHideProperty()
  @IsOptional()
  @IsMongoId()
  owner: string;

  @IsMongoId()
  plant_id: string;

  @IsDateString()
  publish_date: Date;

  @IsEnum(FeedKind)
  kind: FeedKind;

  @IsString()
  content: string;

  @IsString()
  image_url: string;
}

export class UpdateFeedDto extends PartialType(CreateFeedDto) {}

export class GetFeedQuery {
  owner: string;

  plant_id: string;

  publish_date: string;

  kind: FeedKind;

  limit: number;

  offset: number;

  order_by: GetFeedOrderBy;
}

export enum GetFeedOrderBy {
  ASC = 'asc',
  DESC = 'desc',
}

