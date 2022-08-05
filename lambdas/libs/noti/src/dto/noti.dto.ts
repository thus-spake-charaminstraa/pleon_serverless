import { NotiKind } from '@app/common/types';
import { PartialType } from '@nestjs/swagger';

export class CreateNotiDto {
  owner: string;

  plant_id: string;

  content: string;

  kind: NotiKind;
}

export class UpdateNotiDto extends PartialType(CreateNotiDto) { }

export class GetNotiQuery {
  owner?: string;

  plant_id?: string;

  kind?: NotiKind;
}
