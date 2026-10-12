export const alarmOvertimeOptions = [
  {
    label: '超时',
    value: 'TIMED_OUT',
  },
  {
    label: '正常',
    value: 'NORMAL',
  },
]
export const alarmHandleOptions = [
  {
    label: '所有',
    value: '',
  },
  {
    label: '待接收',
    value: 'ALARM_UN_CONFIRMED',
    color: '#D9001B',
  },
  {
    label: '处理中',
    value: 'ALARM_PROGRESS_CONFIRMED',
    color: '#F59A23',
  },
  {
    label: '已挂起',
    value: 'ALARM_SUSPEND',
    color: '#02A7F0',
  },
  {
    label: '已处理',
    value: 'ALARM_HANDLER',
    color: '#70B603',
  },
]
export const alarmHandlerResultOptions = [
  {
    label: '实报',
    value: 'ALARM_ACTUAL',
  },
  {
    label: '误报',
    value: 'ALARM_IMPRACTICAL',
  },
]
