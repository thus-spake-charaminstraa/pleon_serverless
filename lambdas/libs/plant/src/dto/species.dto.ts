import { IsEnum, IsString } from "class-validator";
import { PlantDifficulty, PlantHumidity, PlantLight } from "../types";

export class CreateSpeciesDto {
  @IsString()
  name: string;

  @IsString()
  scientific_name: string;

  @IsString()
  english_name: string;

  @IsString()
  plant_feature: string;

  @IsString()
  water_description: string;

  @IsString()
  managing_point: string;

  @IsString()
  species_family: string;

  @IsString()
  proper_temperature: string;

  @IsEnum(PlantLight, { each: true })
  proper_light: PlantLight[];

  @IsEnum(PlantHumidity, { each: true })
  proper_humidity: PlantHumidity[];

  @IsString()
  benefit: string;

  @IsString()
  blight: string;

  @IsEnum(PlantDifficulty)
  managing_difficulty: PlantDifficulty;

  @IsString()
  poison: string;

  @IsString()
  tip: string;
}
