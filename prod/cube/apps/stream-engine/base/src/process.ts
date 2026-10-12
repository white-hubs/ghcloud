export enum ProcessType {
  // 新增流程状态时，需要 businessType
  ADD = 'add',
  // 查看流程详情，需要 processId
  DETAIL = 'detail'
}

export enum FormProcessOperate {
  ADD = 'ADD',
  PASS = 'PASS',
  BACK = 'BACK',
  TRANSFER = 'TRANSFER',
  REPEAT = 'REPEAT',
  UNDO = 'UNO',
  REJECT = 'REFUSE'
}
export const FormProcessOperateEnum: Record<FormProcessOperate, { enName: string; cnName: string }> = {
  [FormProcessOperate.ADD]: {
    enName: 'ADD',
    cnName: '发起',
  },
  [FormProcessOperate.PASS]: {
    enName: 'PASS',
    cnName: '同意',
  },
  [FormProcessOperate.BACK]: {
    enName: 'BACK',
    cnName: '退回',
  },
  [FormProcessOperate.TRANSFER]: {
    enName: 'TRANSFER',
    cnName: '转交',
  },
  [FormProcessOperate.REPEAT]: {
    enName: 'REPEAT',
    cnName: '再次发起',
  },
  [FormProcessOperate.UNDO]: {
    enName: 'UNO',
    cnName: '撤销',
  },
  [FormProcessOperate.REJECT]: {
    enName: 'REFUSE',
    cnName: '驳回',
  },
}
