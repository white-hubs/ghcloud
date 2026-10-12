
export const flowStatus = {
  ACTIVE: '处理中',
  REJECT: '驳回',
  UNDO: '撤销',
  FINISHED: '完成',
}
export const flowTypes = {
  ALL: '全部',
  WAITING: '待我处理',
  SUBMIT: '我发起的',
  SERVED: '抄送给我',
  PROCESSED: '已处理',
}
export const statusText = (str: string): string => {
  const statusMap = new Map([
    ['SUBMIT', '提交'],
    ['UNDO', '撤销'],
    ['REPEAT', '重新提交'],
    ['APPROVAL', '审批'],
    ['BACK', '撤回'],
    ['COPY', '抄送'],
    ['REJECT', '驳回'],
    ['FINISHED', '完成']
  ])
  return statusMap.get(str) || '处理中'
}