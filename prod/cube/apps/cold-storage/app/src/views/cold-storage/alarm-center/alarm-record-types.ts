export type AlarmLevel = "一级" | "二级" | "三级" | "四级";

export type AlarmLevelId = "1" | "2" | "3" | "4";

export type AlarmStatus = "ALARM_UN_CONFIRMED" | "ALARM_PROGRESS_CONFIRMED" | "ALARM_SUSPEND" | "ALARM_HANDLER";

export type AlarmHandlerResult = "ALARM_ACTUAL" | "ALARM_IMPRACTICAL";

export type AlarmTimeoutStatus = "NORMAL" | "TIMED_OUT" | "TIMEOUT";

export type AlarmActionType = "transfer" | "suspend" | "handle" | "followUp" | "pushAgain";

export interface AlarmFile {
  id: string;
  name?: string;
  path?: string;
  type?: string;
  suffix?: string;
  size?: number;
  businessKey?: string | null;
  [key: string]: unknown;
}

export interface AlarmFollowUp {
  id: string;
  content: string;
  createTime: string;
  createUserName: string;
  files: AlarmFile[];
}

export interface AlarmSuspendInfo {
  estimatedProcessTime: string;
  remark: string;
  createTime: string;
  createUserName: string;
  files: AlarmFile[];
  fileVOS?: AlarmFile[];
}

export interface AlarmRecordHandlerReason {
  id?: string;
  alarmReason?: string;
  reason?: string;
}

export interface AlarmHandleInfo {
  alarmHandlerResult: AlarmHandlerResult;
  alarmHandlerResultName: string;
  alarmReason?: string;
  alarmReasonName?: string;
  recordHandlerReason?: AlarmRecordHandlerReason;
  alarmHandlerResultRemark: string;
  createTime: string;
  createUserName: string;
  files: AlarmFile[];
  fileVOS?: AlarmFile[];
}

export interface AlarmRecord {
  id: string;
  applicationCode?: string;
  alarmEventName: string;
  alarmLevelId?: AlarmLevelId;
  alarmLevelName: AlarmLevel;
  areaName: string;
  alarmTargetAddress: string;
  alarmTime: string;
  alarmTargetId?: string;
  alarmTargetName: string;
  alarmTargetType: string;
  timeoutProcessTimesName: string;
  alarmHandlerTimeoutStatus: AlarmTimeoutStatus;
  alarmStatus: AlarmStatus;
  alarmHandlerResult?: AlarmHandlerResult;
  alarmHandlerName?: string;
  alarmHandlerBy?: string;
  alarmNotifyUsers: Array<{ id: string; userId: string; userName: string }>;
  businessKey: string;
  processingTime?: number;
  handler?: AlarmHandleInfo;
  suspend?: AlarmSuspendInfo;
  followUps: AlarmFollowUp[];
}

export interface AlarmRecordQuery {
  keyword: string;
  applicationCode: string;
  deviceIds: string[];
  alarmLevelId: "" | AlarmLevelId;
  alarmLevelName: "" | AlarmLevel;
  alarmStatus: "" | AlarmStatus;
  alarmHandlerResult: "" | AlarmHandlerResult;
  alarmHandlerTimeoutStatus: "" | AlarmTimeoutStatus;
  date: [string, string] | [];
}

export interface AlarmRecordPageQuery extends AlarmRecordQuery {
  pageNumber: number;
  pageSize: number;
}
