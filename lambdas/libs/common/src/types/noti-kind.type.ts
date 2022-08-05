import { ScheduleKind } from "./schedule-kind.enum";

export enum NotiOnlyKind {
  photo = 'photo',
}

export type NotiKind = NotiOnlyKind | ScheduleKind;
export const NotiKind = { ...NotiOnlyKind, ...ScheduleKind };
