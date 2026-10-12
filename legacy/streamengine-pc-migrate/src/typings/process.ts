export enum ProcessType {
  // 新增流程状态时，需要 businessType
  ADD = 'add',
  // 查看流程详情，需要 processId
  DETAIL = 'detail'
}

export interface ProcessRoute {
  query: {
    type?: ProcessType;
    businessType?: string;
    processInstanceId?: string;
    appName?:string;
    title?:string;
    notOperates?:string
  };
}

export enum FormProcessInstanceStatus {
  ACTIVE = 'ACTIVE',
  UNDO = 'UNDO',
  REJECTED = 'REJECT',
  FINISHED = 'FINISHED',
  REPEATED = 'REPEAT',
}

export enum FormProcessOperate {
  ADD = 'ADD',
  PASS = 'PASS',
  BACK = 'BACK',
  TRANSFER = 'TRANSFER',
  REPEAT = 'REPEAT',
  UNDO = 'UNDO',
  REJECT = 'REJECT',
  WITHDRAW='WITHDRAW',
  COMMENT='COMMENT'
}

export interface FormProcessInstance {
  // 发起该流程的用户 ID
  startUserId: string;
  // 当前流程状态
  status: FormProcessInstanceStatus;
}

export const FormProcessOperateEnum: Record<FormProcessOperate, { enName: string; cnName: string;btnType:string }> = {
  [FormProcessOperate.ADD]: {
    enName: 'ADD',
    cnName: '发起',
    btnType:'primary'
  },
  [FormProcessOperate.PASS]: {
    enName: 'PASS',
    cnName: '同意',
    btnType:'primary'
  },
  [FormProcessOperate.BACK]: {
    enName: 'BACK',
    cnName: '退回',
    btnType:'primary'
  },
  [FormProcessOperate.TRANSFER]: {
    enName: 'TRANSFER',
    cnName: '转交',
    btnType:'primary'
  },
  [FormProcessOperate.REPEAT]: {
    enName: 'REPEAT',
    cnName: '再次发起',
    btnType:'primary'
  },
  [FormProcessOperate.UNDO]: {
    enName: 'UNO',
    cnName: '撤销',
    btnType:'primary'
  },
  [FormProcessOperate.REJECT]: {
    enName: 'REJECT',
    cnName: '驳回',
    btnType:'danger'
  },
  [FormProcessOperate.WITHDRAW]: {
    enName: 'WITHDRAW',
    cnName: '撤回',
    btnType:'primary'
  },
  [FormProcessOperate.COMMENT]: {
    enName: 'COMMENT',
    cnName: '评论',
    btnType:'primary'
  },
}