import { ApiHideProperty, PartialType, PickType } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsMongoId,
  IsOptional,
  IsString,
} from 'class-validator';
import { Plant } from '../entities/plant.entity';
import { PlantAir, PlantLight } from '../types/plant-env.type';

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
  adopt_date: string | Date;

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

export class UpdatePlantDto extends PartialType(
  PickType(CreatePlantDto, [
    'name',
    'thumbnail',
    'light',
    'air',
    'adopt_date',
  ] as const),
) {}

export class GetPlantResDto extends Plant {
  d_day: number;
}

export class GetPlantQuery {
  owner?: string;
}
