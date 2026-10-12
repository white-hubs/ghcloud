import type { AlarmHandlerResult, AlarmStatus } from "./alarm-record-types";

export const alarmLevelColor: Record<string, string> = {
  一级: "#ff3b34",
  二级: "#ff6e34",
  三级: "#ffc234",
  四级: "#1677ff",
};

export const alarmStatusText: Record<AlarmStatus, string> = {
  ALARM_UN_CONFIRMED: "待确认",
  ALARM_PROGRESS_CONFIRMED: "处理中",
  ALARM_SUSPEND: "已挂起",
  ALARM_HANDLER: "已关闭",
};

export const alarmStatusColor: Record<AlarmStatus, string> = {
  ALARM_UN_CONFIRMED: "#d9001b",
  ALARM_PROGRESS_CONFIRMED: "#e8a600",
  ALARM_SUSPEND: "#02a7f0",
  ALARM_HANDLER: "#70b603",
};

export const alarmResultText = {
  ALARM_ACTUAL: "实报",
  ALARM_IMPRACTICAL: "误报",
};

export const alarmResultOptions: Array<{ label: string; value: AlarmHandlerResult }> = (
  Object.keys(alarmResultText) as AlarmHandlerResult[]
).map((value) => ({ label: alarmResultText[value], value }));

export const alarmTimeoutText = {
  NORMAL: "正常",
  TIMED_OUT: "超时",
  TIMEOUT: "超时",
};

export const alarmTimeoutColor = {
  NORMAL: "#70b603",
  TIMED_OUT: "#d9001b",
  TIMEOUT: "#d9001b",
};
