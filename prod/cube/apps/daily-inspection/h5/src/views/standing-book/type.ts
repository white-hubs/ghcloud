export const StatusType = new Map(
  [
    ['ACCEPT', '待接收'],
    ['CONFIRM', '待确认'],
    ['EXECUTING', '待巡检'],
    ['OVER', '已巡检'],
    ['EXPIRE', '已过期'],
    ['STOP', '已停止'],
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
  ]
)
