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
  pubilsh_date: string;

  @IsEnum(FeedKind)
  kind: FeedKind;

  @IsString()
  content: string;

  @IsString({ each: true })
  image_urls: string[];
}

export class UpdateFeedDto extends PartialType(CreateFeedDto) {}
