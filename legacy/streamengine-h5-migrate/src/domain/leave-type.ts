/**
 * 请假最小时间单位
 */
export enum LeaveTimeUnit {
  // 半天
  HALF_DAY = 'HALF_DAY',
  // 天
  DAY = 'DAY',
  // 小时
  HOUR = 'HOUR',
  // 分钟
  MINUTE = 'MINUTE'
}

export interface LeaveType {
  id: string;
  label: string;
  leaveRule: { minimumLeaveTimeUnit: LeaveTimeUnit; };
  value: string;
}

export interface LeaveTypeOption {
  id: string;
  name: string;
  minimumLeaveTimeUnitConvert: {
    minimumLeaveTimeUnit: LeaveTimeUnit;
  };
}
