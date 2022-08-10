import { PartialType } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { NotiKind } from '../types';

export class CreateNotiDto {
  owner: string;

  plant_id: string;

  content: string;

  kind: NotiKind;
}

export class UpdateNotiDto extends PartialType(CreateNotiDto) { }

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
  plant_id: string;
}
