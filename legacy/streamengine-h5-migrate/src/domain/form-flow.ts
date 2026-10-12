import { FormItemObjectValue } from "../business/dynamic-table/form-item";

export interface FormFlow {
  callType: string;
  id: string;
  name: string;
  type: string;
  formJson: string;
  flowJson: string;
  application: string;
  applicationName: string;
  flowKey: string;
  formDefinitionId: string;
  formDefinitionVersion: number;
  formKey: string;
  businessTypeName: string;
}

export interface FormOption {
  id: string;
  title: string;
  name: string;
  show?: boolean;
  props: {
    options: string[];
    required: boolean;
    disabled: boolean;
    useAsBackLogTitle?: boolean;
    items?: FormOption[];
    params?: string;
    format?: string;
    visible?: boolean;
    placeholder?: string;
    relateParams?: any;
    [key: `params${number}`]: string;
  };
}

export enum FormProcessOperate {
  ADD = "ADD",
  PASS = "PASS",
  BACK = "BACK",
  TRANSFER = "TRANSFER",
  REPEAT = "REPEAT",
  UNDO = "UNDO",
  REJECT = "REJECT",
  WITHDRAW = "WITHDRAW",
  COMMENT = "COMMENT",
}

export const FormProcessOperateEnum: Record<FormProcessOperate, { enName: string; cnName: string }> = {
  [FormProcessOperate.ADD]: {
    enName: "ADD",
    cnName: "发起申请",
  },
  [FormProcessOperate.PASS]: {
    enName: "PASS",
    cnName: "同意",
  },
  [FormProcessOperate.BACK]: {
    enName: "BACK",
    cnName: "退回",
  },
  [FormProcessOperate.TRANSFER]: {
    enName: "TRANSFER",
    cnName: "转交",
  },
  [FormProcessOperate.REPEAT]: {
    enName: "REPEAT",
    cnName: "再次发起",
  },
  [FormProcessOperate.UNDO]: {
    enName: "UNDO",
    cnName: "撤销",
  },
  [FormProcessOperate.REJECT]: {
    enName: "REJECT",
    cnName: "驳回",
  },
  [FormProcessOperate.WITHDRAW]: {
    enName: "WITHDRAW",
    cnName: "撤回",
  },
  [FormProcessOperate.COMMENT]: {
    enName: "COMMENT",
    cnName: "评论",
  },
};

export interface FormProcess {
  id: string;
  props: {
    taskOperations?: FormProcessOperate[];
    assignedType: "ROLE" | "ASSIGED_USER";
    role: FormItemObjectValue[];
    assignedUser: FormItemObjectValue[];
  };
  children: Partial<FormProcess>;
  branchs?: FormProcess[];
}

// TODO(danke): 与 FormProcessOperate 高度雷同，考虑业务语义上是否相同
export enum FormProcessInstanceStatus {
  ACTIVE = "ACTIVE",
  UNDO = "UNDO",
  REJECTED = "REJECT",
  FINISHED = "FINISHED",
  REPEATED = "REPEAT",
}

export interface FormProcessInstance {
  [x: string]: unknown;
  // 发起该流程的用户 ID
  startUserId: string;
  // 当前流程状态
  status: FormProcessInstanceStatus;
  // 流程实例ID
  processInstanceId: string;
  operateAlias: {
    code: FormProcessOperate;
    name: string;
    alias: string;
  }[];
}

export interface FormFlowInstance {
  id: string;
  data: string;
  key: string;
  flowKey: string;
  businessType: string;
  properties: {
    formInstanceId: string;
    formJson: string;
    processJson: string;
  };
  processInstanceRunningInfo: FormProcessInstance;
  // 当前流程剩余处理人 id 集
  remainderOfActive: string[];
  withdraw: boolean;
}

export interface ApprovalOpinion {
  /**
   * 附件id集合
   */
  attachmentIds?: number[];
  /**
   * 手写签名，此为图片上传后的id
   */
  sign?: number;
  /**
   * 文本意见
   */
  text?: string;
}
