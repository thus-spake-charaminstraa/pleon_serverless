import { ApiHideProperty, PartialType } from '@nestjs/swagger';
import {
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { NotiKind } from '../types/noti-kind.type';

export class CreateNotiDto {
  @ApiHideProperty()
  @IsOptional()
  @IsMongoId()
  owner: string;

  @IsMongoId()
  plant_id: string;

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

export class NotiManageDto {
  @IsEnum(NotiManageKind)
  type: NotiManageKind;
}

export class GetNotiQuery {
  owner?: string;

  plant_id?: string;

  kind?: NotiKind;
}

export class DeleteNotiQuery {
  owner?: string;

  plant_id?: string;

  kind?: NotiKind;
}
