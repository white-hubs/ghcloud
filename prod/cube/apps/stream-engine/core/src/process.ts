export enum ProcessType {
  // 新增流程状态时，需要 businessType
  ADD = 'add',
  // 查看流程详情，需要 processId
  DETAIL = 'detail'
}

export enum FormProcessOperate {
  PASS = 'PASS',
  BACK = 'BACK',
  TRANSFER = 'TRANSFER',
  REPEAT = 'REPEAT',
  UNDO = 'UNO',
  REJECT = 'REFUSE'
}
export const FormProcessOperateEnum: Record<FormProcessOperate, { enName: string; cnName: string;btnType: string; }> = {
  [FormProcessOperate.PASS]: {
    enName: 'PASS',
    cnName: '同意',
    btnType: 'primary'
  },
  [FormProcessOperate.BACK]: {
    enName: 'BACK',
    cnName: '退回',
    btnType: 'primary'
  },
  [FormProcessOperate.TRANSFER]: {
    enName: 'TRANSFER',
    cnName: '转交',
    btnType: 'primary'
  },
  [FormProcessOperate.REPEAT]: {
    enName: 'REPEAT',
    cnName: '再次发起',
    btnType: 'primary'
  },
  [FormProcessOperate.UNDO]: {
    enName: 'UNO',
    cnName: '撤销',
    btnType: 'primary'
  },
  [FormProcessOperate.REJECT]: {
    enName: 'REFUSE',
    cnName: '驳回',
    btnType: 'danger'
  },
}
