import type { NoticeType } from '../common/select-notice/select-notice.model'

export interface AlarmAssignType<T> {
  actionType: T;
  enabled: boolean;
  actionConfig: NoticeType;
}

export interface AlarmAssignRef {
  getValue: () => AlarmAssignType<'ALARM_NOTIFY_ACTION'>;
  addRule: () => void;
}
