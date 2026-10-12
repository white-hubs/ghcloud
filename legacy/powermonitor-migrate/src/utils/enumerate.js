export const patrolStatus = {
  CAMERA_PATROL_UNKNOWN: "未巡",
  CAMERA_PATROL_COMPLETE: "已巡",
};
export const alarmOvertimeEnumerate = [
  {
    label: "超时",
    value: "TIMED_OUT",
  },
  {
    label: "正常",
    value: "NORMAL",
  },
];
export const alarmHandleEnumerate = [
  {
    label: "所有",
    value: "",
  },
  {
    label: "待确认",
    value: "ALARM_UN_CONFIRMED",
    color: "#D9001B",
  },
  {
    label: "处理中",
    value: "ALARM_PROGRESS_CONFIRMED",
    color: "#F59A23",
  },
  {
    label: "已挂起",
    value: "ALARM_SUSPEND",
    color: "#02A7F0",
  },
  {
    label: "已处理",
    value: "ALARM_HANDLER",
    color: "#70B603",
  },
];
export const actionResult = [
  {
    value: "ARRIVAL",
    label: "下发成功",
  },
  {
    value: "ISSUING",
    label: "下发中",
  },
  {
    value: "SUCCESS",
    label: "执行成功",
  },
  {
    value: "FAIL",
    label: "执行失败",
  },
  {
    value: "EXPIRED",
    label: "执行超时",
  },
];
export const leaveAalrmColor = {
  one_level: "#FF4070",
  two_level: "#FBA33F",
  three_level: "#5654F5",
  four_level: "#1890FF",
};
// 通知方式
export const notifyTypeList = [
  {
    value: "IMMEDIATELY_NOTIFY",
    label: "及时通知",
  },
  {
    value: "DELAY_NOTIFY",
    label: "延迟通知",
  },
  {
    value: "TIMEOUT_NOTIFY",
    label: "超时通知",
  },
];
export const messageTargetOptions = [
  {
    label: "部门",
    value: "DEPARTMENT",
    url: "deptList",
  },
  {
    label: "角色",
    value: "ROLE",
  },
  {
    label: "用户组",
    value: "USER_GROUP",
  },
  {
    label: "用户",
    value: "USER",
    url: "getStaffList",
  },
];
export const comparator = [
  {
    value: "EQ",
    label: "等于",
  },
  {
    value: "NE",
    label: "不等于",
  },
  {
    value: "IN",
    label: "包含",
  },
  {
    value: "GT",
    label: "大于",
  },
  {
    value: "GE",
    label: "大于等于",
  },
  {
    value: "LT",
    label: "小于",
  },
  {
    value: "LE",
    label: "小于等于",
  },
  {
    value: "NOT_IN",
    label: "不包含",
  },
];
export const attributeType = [
  {
    value: "DEVICE_EVENT_CONDITION",
    label: "设备事件",
  },
  {
    value: "CUSTOM_RULE_CONDITION",
    label: "属性判断",
  },
];
export const actionTypes = [
  {
    value: "AUTOMATIC",
    label: "自动执行",
  },
  {
    value: "MANUAL",
    label: "手动执行",
  },
];
export const timeUnit = [
  {
    label: "月",
    value: "MONTH",
  },
  {
    label: "天",
    value: "DAY",
  },
  {
    label: "小时",
    value: "HOUR",
  },
  {
    label: "分钟",
    value: "MINUTE",
  },
  {
    label: "秒",
    value: "SECOND",
  },
];
