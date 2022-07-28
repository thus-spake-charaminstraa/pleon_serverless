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
