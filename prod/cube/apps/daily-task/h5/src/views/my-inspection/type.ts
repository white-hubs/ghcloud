export const StatusType = new Map(
  [
    ['ACCEPT', '待接收'],
    ['CONFIRM', '待确认'],
    ['EXECUTING', '待巡检'],
    ['OVER', '已巡检'],
    ['EXPIRE', '已过期'],
    ['STOP', '已终止'],
    ['CANCEL_INSPECT', '取消巡检'],
    ['WAIT_REPAIR', '待修复'],
    ['REPAIRED', '已修复'],
    ['CANCEL_REPAIR', '取消修复'],

  ]
)
export const StatusObjectType = new Map(
  [
    ['ACCEPT', '待接收'],
    ['CONFIRM', '待确认'],
    ['EXECUTING', '待巡检'],
    ['OVER', '已完成'],
    ['EXPIRE', '已过期'],
    ['STOP', '已终止'],
    ['WAIT_REPAIR', '待修复'],
    ['REPAIRED', '已修复'],
    ['CANCEL_REPAIR', '取消修复'],
    ['CANCEL_INSPECT', '取消巡检'],

  ]
)
export const StatusColor = new Map(
  [
    ['ACCEPT', '#ffaa26'],
    ['CONFIRM', '#1d66ff'],
    ['EXECUTING', '#ffaa26'],
    ['OVER', '#6ab539'],
    ['EXPIRE', '#ff4158'],
    ['STOP', '#969799'],
    ['WAIT_REPAIR', '#ff8f1f'], // 添加待修复状态颜色
    ['REPAIRED', '#07c160'], // 添加已修复状态颜色
    ['CANCEL_REPAIR', '#33433bff'], // 添加已修复状态颜色
  ]
)
export const StatusColorBg = new Map(
  [
    ['ACCEPT', 'rgba(255,170,38,.1)'],
    ['CONFIRM', 'rgb(29,102,255,.1)'],
    ['EXECUTING', 'rgb(255,170,38,.1)'],
    ['OVER', 'rgb(106,181,57,.1)'],
    ['EXPIRE', 'rgb(255,65,88,.1)'],
    ['STOP', 'rgb(150,151,153,.1)'],
    ['WAIT_REPAIR', 'rgba(255,143,31,.1)'], // 添加待修复状态背景颜色
    ['REPAIRED', 'rgba(7,193,96,.1)'], // 添加已修复状态背景颜色
    ['CANCEL_REPAIR', 'rgba(28, 37, 32, 0.1)'], // 添加已修复状态背景颜色
  ]
)
