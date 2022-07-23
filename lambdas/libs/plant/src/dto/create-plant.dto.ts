import { PlantAir, PlantLight } from "@app/common/types";
import { ApiHideProperty } from "@nestjs/swagger";
import { IsArray, IsDateString, IsEnum, IsMongoId, IsOptional, IsString } from "class-validator";

export class CreatePlantDto {
  @IsString()
  name: string;

  @ApiHideProperty()
  @IsOptional()
  @IsMongoId()
  owner: string;

  @IsString()
  species: string;

  @IsDateString()
  adopt_date: Date;

  @IsString()
  thumbnail: string;

  @IsEnum(PlantLight)
  light: PlantLight;

  @IsEnum(PlantAir)
  air: PlantAir;
}

export class CreatePlantApiDto extends CreatePlantDto {
  @IsDateString()
  water_date: Date;
}