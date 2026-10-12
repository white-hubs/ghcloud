export const types = [
  {
    value: " ",
    label: "全部",
  },
  {
    value: true,
    label: "启用",
  },
  {
    value: false,
    label: "禁用",
  },
];
export const alarmLevel = [
  {
    value: 1,
    label: "一般",
  },
  {
    value: 2,
    label: "严重",
  },
  {
    value: 3,
    label: "紧急",
  },
];
export const strategyStatus = [
  {
    value: true,
    label: "启用",
  },
  {
    value: false,
    label: "停用",
  },
];
export const comparator = [
  {
    value: "EQ",
    label: "等于",
  },
  {
    value: "GE",
    label: "大于等于",
  },
  {
    value: "LE",
    label: "小于等于",
  },
  {
    value: "GT",
    label: "大于",
  },
  {
    value: "LT",
    label: "小于",
  },
];
export const attributeType = [
  {
    value: "IOT_DEVICE_EVENT",
    label: "设备事件",
  },
  {
    value: "IOT_DEVICE_PRO_CONDITION",
    label: "属性判断",
  },
];
export const videoEvent = [
  {
    value: "VIDEOTAPE",
    label: "监控录像",
  },
  {
    value: "PHOTOGRAPH",
    label: "监控抓拍",
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
export const actionResult = [
  {
    value: "ISSUE_SUCCESS",
    label: "下发成功",
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
    label: "超时",
  },
];
export const alarmStatus = [
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

