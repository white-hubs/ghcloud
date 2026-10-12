import type { AlarmRecordItem } from "./alarm-record-mapper";

/** 开发环境模拟报警 ID，访问 /evacuation-guide?id=dev-mock-alarm */
export const DEV_MOCK_ALARM_ID = "dev-mock-alarm";

const DEV_MOCK_ALARM_LONGITUDE = "114.0575985486006,22.547256192051847";

/** 开发环境定位失败时的兜底用户坐标（模拟报警点附近） */
export const DEV_MOCK_USER_POINT = { lng: 114.0572, lat: 22.5478 };

export function isDevMockAlarmId(id: string | undefined): boolean {
  return import.meta.env.DEV && id === DEV_MOCK_ALARM_ID;
}

export function createDevMockAlarmRecord(): AlarmRecordItem {
  return {
    id: DEV_MOCK_ALARM_ID,
    alarmTypeName: "火灾报警（模拟）",
    alarmLevelName: "一级",
    alarmLevelSort: 1,
    alarmStatus: "ALARM_UN_CONFIRMED",
    alarmStatusName: "待处理",
    areaName: "模拟报警区域",
    alarmTargetAddress: "深圳市南山区模拟点位",
    alarmTargetLongitude: DEV_MOCK_ALARM_LONGITUDE,
    alarmTime: Date.now(),
  };
}
