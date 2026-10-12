// 邀请状态
export enum InviteStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  REJECTED = 'REJECTED',
  COMPLETE = 'COMPLETE',
  EXPIRED = 'EXPIRED'
}
export const InviteStatusOptions = [
  {
    label: '待处理',
    value: 'PENDING',
    color: '#1578FF',
    bgColor: 'rgba(21,120,255,0.1)'
  },
  {
    label: '处理中',
    value: 'PROCESSING',
    color: '#1578FF',
    bgColor: 'rgba(21,120,255,0.1)'
  },
  {
    label: '已驳回',
    value: 'REJECTED',
    color: '#F69703',
    bgColor: 'rgba(246,151,3,0.1)'
  },
  {
    label: '已完成',
    value: 'COMPLETE',
    color: '#52c41a',
    bgColor: 'rgba(106,181,57,0.1)'
  },
  {
    label: '已失效',
    value: 'EXPIRED',
    color: '#323232',
    bgColor: 'rgba(50,50,50,0.1)'
  }
]
