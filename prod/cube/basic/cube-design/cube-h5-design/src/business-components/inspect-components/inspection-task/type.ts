// 巡检分页参数
export interface InspectionParams {
  pageNumber?: number;
  pageSize?: number;
  [key: string]: unknown;
}
export const StatusType = new Map(
  [
    ['ACCEPT', '待接收'],
    ['CONFIRM', '待确认'],
    ['EXECUTING', '待巡检'],
    ['OVER', '已完成'],
    ['EXPIRE', '已过期'],
    ['STOP', '已终止'],
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
export const StatusColorBg = new Map(
  [
    ['ACCEPT', 'rgba(255,170,38,.1)'],
    ['CONFIRM', 'rgb(29,102,255,.1)'],
    ['EXECUTING', 'rgb(255,170,38,.1)'],
    ['OVER', 'rgb(106,181,57,.1)'],
    ['EXPIRE', 'rgb(255,65,88,.1)'],
    ['STOP', 'rgb(150,151,153,.1)'],
  ]
)
