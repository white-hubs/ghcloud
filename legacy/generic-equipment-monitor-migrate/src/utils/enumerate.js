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
    label: "待接收",
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
export const alarmHandleEnumeTimes = [
  {
    label: "确认告警",
    value: "CONFIRM_ALARM",
    color: "#D9001B",
  },
  {
    label: "疑似告警",
    value: "SUSPECTED_ALARM",
    color: "#F59A23",
  },
];
export const getAlarmHandleEnumeTimes = (value) => {
  const data = alarmHandleEnumeTimes.filter((item) => item.value === value);
  if (data.length) {
    return data[0].label;
  } else {
    return "--";
  }
};
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
export const alarmHandlerResultEnumerate = [
  {
    label: "实报",
    value: "ALARM_ACTUAL",
  },
  {
    label: "误报",
    value: "ALARM_IMPRACTICAL",
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

/** 线损预警：与报警详情/列表记录中的 `alarmTypeCode` 一致 */
export const LINE_LOSS_ALARM_TYPE_CODE = "LINE_LOSS_MANAGEMENT";

export const applicationCodeGroud = {
  AIRCONDITIONER: "空调",
  WATERSUPPLYDRAINAGE: "给排水",
  AIRSUPPLYANDEXHAUST: "送排风",
  ROTATINGMANAGE: "动环",
  ELECTRICMANAGE: "电气",
  FIRECONTROL: "消防",
  SECURITY_MONITORING: "安防监控",
  BROADCAST_CENTER: "广播",
  TELECOMMUNICATIONS: "无线通讯",
  NETWORKMONITORIN: "计算机网络",
  INTELLIGENT_LIGHTING: "照明",
  INFORMATION_PUBLISH: "电子屏",
  LIFT_MANAGEMENT: "电梯",
  INTRUDER_ALARM: "入侵报警",
  MEDICAL_GAS: "医用气体",
  SEWAGE_TREATMENT: "污水处理",
  TRIAGE_RANK: "分诊排号",
  MEDICAL_INTERCOM: "医护对讲",
  SURGICAL_INSTRUCTION: "手术示教",
  MEDICAL_CRYOEXTRACTO: "医用冷冻冷藏",
  ICU_MONITORING: "ICU监测",
  MEETING_ROOM_MANAGEM: "会议",
  MEAT_TRADE: "肉类滑轨",
  LOGISTICS: "物流",
  WATERPURIFICATION: "净水",
  BOLIER: "锅炉",
  PURIFICATION: "净化",
  COLDANDHEATSOURCES: "冷热源",
  AIRSOURCE: "空气源",
  COOLINGWATER: "冷冻水",
  GAS_MANAGEMENT: "用气",
  PERIMETER_PREVENTION: "周界防范",
  PASSENGER_FLOW_ANAL: "客流分析",
  SECURITY_CHECKP: "安检通道",
  FRESH_AIR_MANAGEMENT: "新风管理",
  CLEANCONDITIONING: "洁净空调",
  POWER_SUPPLY_DISTRIB: "供配电",
  GARDENS: "园林系统",
  VISITOR_MANAGEMENT: "访客管理",
  BOOKS_MANAGEMENT: "图书管理",
  "MEDICAL-REFRIGERATIO": "医用冷藏",
  TRAFFIC_FLOW_MONIRIN: "车流量监测",
  TRAFFIC_CONTROL: "交通控制",
  TRAFFIC_LIGHT_SYS: "交通灯系统",
  ENVIRONMENT_MONITORI: "环境监控",
  EMERGENCY_CALL: "紧急电话",
  EMERGENCY_RESOURCES: "应急资源",
  DOORMANAGE: "门禁",
  OPERATING_ROOM: "医疗洁净",
  PARKINGMANAGE: "停车管理",
  ULTRA_FINE_DRY_POWDE: "超细干粉",
  VIDEO_INTERCOM: "可视对讲",
  INTERVIEW: "会见管理",
  PERSONNEL_COUNT: "人员清点",
  ULTRASONIC: "超声波",
  WIRELESS_INTERCOM: "无线对讲",
  WIRELESS_WIFI: "无线WIFI",
  CHARGING_STATION: "充电桩",
  TOILET_CONTROL: "厕所管控",
  SOLAR_ENERGY: "太阳能热水",
  CUSTOMER_CONTROL: "客控管理",
  LEAKAGE_DETECTION: "漏水检测",
  IPTV_MANAGEMENT: "IPTV管理",
};
