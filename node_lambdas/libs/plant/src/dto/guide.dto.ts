import { IsEnum, IsString } from "class-validator";
import { GuideManageKind } from "../types/guide-manage.type";

export class GuideManageDto {
  @IsString()
  noti_id: string;

  @IsEnum(GuideManageKind)
  type: GuideManageKind;
}