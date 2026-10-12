import type { TargetModifyParams } from '../common/select-notice/select-notice.model'

export interface AlarmMessageModel {
  enabled: boolean;
  actionType: 'MESSAGE_NOTIFY_ACTION';
  id: string;
  actionConfig: AlarmMessageType[];
}
export interface AlarmMessageType {
  id: string;
  delayTimeUnit: string;
  duration: number | string;
  notifyType: null | string;
  channelTypes: string[];
  targetModifyParams: TargetModifyParams[];
}

export interface AlarmMessageRef {
  getValue: () => Promise< AlarmMessageModel>;
  changeEnabled: (enabled: boolean) => void;
}
