import { IsArray, IsDateString, IsMongoId, IsOptional, IsString } from "class-validator";

export class CreatePlantDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsMongoId()
  owner: string;

  @IsString()
  species: string;

  @IsString()
  adopt_date: string;

  @IsArray()
  water_date: Array<string>;

  @IsString()
  thumbnail: string;

  @IsString()
  location: string;
}
