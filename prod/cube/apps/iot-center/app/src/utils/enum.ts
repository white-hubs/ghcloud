export const eventConfigType = [
  {
    value: 'THRESHOLD_SETTING',
    label: '阈值配置',
  },
  {
    value: 'PARAMETER_SETTING',
    label: '参数配置',
  },
]
export const conditionType = [
  {
    value: 'DEVICE_EVENT_CONDITION',
    label: '设备事件',
  },
  {
    value: 'CUSTOM_RULE_CONDITION',
    label: '属性判断',
  },
]
export const comparator = [
  {
    value: 'EQ',
    label: '等于',
  },
  {
    value: 'NE',
    label: '不等于',
  },
  {
    value: 'IN',
    label: '包含',
  },
  {
    value: 'GT',
    label: '大于',
  },
  {
    value: 'GE',
    label: '大于等于',
  },
  {
    value: 'LT',
    label: '小于',
  },
  {
    value: 'LE',
    label: '小于等于',
  },
  {
    value: 'NOT_IN',
    label: '不包含',
  },
]
export const notifyCommandDispatchOption = [
  {
    label: '是',
    value: true
  },
  {
    label: '否',
    value: false
  }
]
export const period = [
  {
    value: 'ALL',
    label: '全天',
  },
  {
    value: 'WEEK',
    label: '周',
  },
  {
    value: 'MONTH',
    label: '月',
  },
  {
    value: 'TIME',
    label: '时段',
  },

]
export const messageTargetOptionsEnum = [
  {
    label: '部门',
    value: 'DEPARTMENT',
  },
  {
    label: '角色',
    value: 'ROLE',
  },

  {
    label: '用户',
    value: 'USER',
  },
]
// 通知方式
export const notifyTypeList = [
  {
    value: 'IMMEDIATELY_NOTIFY',
    label: '及时通知',
  },
  // {
  //   value: 'DELAY_NOTIFY',
  //   label: '延迟通知',
  // },
  {
    value: 'TIMEOUT_NOTIFY',
    label: '超时通知',
  },
]
export const actionTypes = [
  {
    value: 'AUTOMATIC',
    label: '自动执行',
  },
  {
    value: 'MANUAL',
    label: '手动执行',
  },
]
export const weekList = [
  {
    value: 2,
    label: '周一',
  },
  {
    value: 3,
    label: '周二',
  },
  {
    value: 4,
    label: '周三',
  },
  {
    value: 5,
    label: '周四',
  },
  {
    value: 6,
    label: '周五',
  },
  {
    value: 7,
    label: '周六',
  },
  {
    value: 1,
    label: '周天',
  },
]

/** 设备时间 报警参数分类 */
export const deviceEventAlarmType = [
  {
    value: '@dev_event_delay@',
    label: '报警延迟',
  },
  {
    value: '@dev_event_interval@',
    label: '报警间隔',
  },
]
