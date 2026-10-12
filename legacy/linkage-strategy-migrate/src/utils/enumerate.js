export const types = [
  {
    value: null,
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
      value:1,
      label:"一般"
  },
  {
      value:2,
      label:"严重"
  },
  {
      value:3,
      label:"紧急"
  }
]
export const strategyStatus = [
  {
      value: true,
      label: "启用",
    },
    {
      value: false,
      label: "停用",
    }
]
export const comparator = [
{
  value:"EQ",
  label:"="
},
{
  value:"GE",
  label:">="
},
{
  value:"LE",
  label:"<="
},
{
  value:"GT",
  label:">"
},
{
  value:"LT",
  label:"<"
}
]
export const attributeType = [
{
  value:'IOT_DEVICE_EVENT',
  label:"设备事件"
},
{
  value:'IOT_DEVICE_PRO_CONDITION',
  label:"属性判断"
}
]
export const videoEvent = [
{
  value:"VIDEOTAPE",
  label:"监控录像"
},
{
  value:"PHOTOGRAPH",
  label:"监控抓拍"
}
]
export const actionTypes = [
{
  value:"AUTOMATIC",
  label:"自动执行"
},
{
  value:"MANUAL",
  label:"手动执行"
}
]
// 通知方式
export const notifyTypeList = [
{
  value:1,
  label:"站内浮窗通知"
},
{
  value:2,
  label:"站内弹窗通知"
},
{
  value:3,
  label:"短息通知"
},
{
  value:4,
  label:"app通知"
}
]
export const actionResult = [
  {
    value:"ISSUE_SUCCESS",
    label:"下发成功"
  },
  {
    value:"SUCCESS",
    label:"执行成功"
  },
  {
    value:"FAIL",
    label:"执行失败"
  },
  {
    value:"EXPIRED",
    label:"超时"
  },
]
export const timeModeList = [
{
  value:"IMMEDIATELY_NOTIFY",
  label:"及时通知"
},
{
  value:"DELAY_NOTIFY",
  label:"延时通知"
},
]
export const alarmStatus = [
  {
    label:"所有",
    value:""
  },
  {
    label:"待确认",
    value:"ALARM_UN_CONFIRMED"
  },
  {
    label:"处理中",
    value:"ALARM_PROGRESS_CONFIRMED"
  },
  {
    label:"已确认",
    value:"ALARM_CONFIRMED"
  },
]
export const loopList = [
  {
    label:"循环",
    value:true,
  },
  {
    label:"单次",
    value:false
  }
]