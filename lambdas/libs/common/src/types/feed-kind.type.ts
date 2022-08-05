import { ScheduleKind } from '@app/common';

export enum FeedOnlyKind {
  today = 'today',
  leaf = 'leaf',
  flower = 'flower',
  fruit = 'fruit',
  etc = 'etc',
}

export type FeedKind = FeedOnlyKind | ScheduleKind;
export const FeedKind = { ...FeedOnlyKind, ...ScheduleKind };
