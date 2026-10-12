
// 操作员
export interface IPerson {
  id: string;
  name: string;
  preReduceSign: boolean; // 减签标识 为false表示不能减签
}
// 审批对象
export interface IApproval {
  text: string;
  attachmentIds: [];
  sign: string;
}
// 任务操作
export enum ETaskType {
  SUBMIT = '提交',
  UNDO = '撤销',
  REPEAT = '重新提交',
  APPROVAL = '审批',
  BACK = '撤回',
  COPY = '抄送',
  REJECT = '拒绝',
  FINISHED = '完成',
  TRANSFER = '转交',
}

export interface ITaskOption {
  residualOperator?: IPerson; // 剩余任务处理人

  // 当前节点的操作历史
  operation?: {
    createTime?: string; // 创建时间
    name?: string;
    operator?: IPerson; // 操作人
    approvalOpinion?: IApproval; // 审批意见对象
    type?: ETaskType; // 任务操作枚举
  };
  // 当前节点的评论
  feedbackLogs:{feedbackUser:string;feedbackTime:number;feedbackInfo:string;fileVOList:any[]}[]
}

// 进度
export interface ProcessLine {
  nodeName: string; // 节点唯一标识
  nodeKey: string; // 节点名称
  assigneeList: IPerson[]; // 预分配人 此项有值说明当前不是活跃节点, 就可以添加人员
  taskOperations: ITaskOption[];
  personList?: {
    person: any;
    feedbackLogs:{feedbackUser:string;feedbackTime:number;feedbackInfo:string;fileVOList:any[]}[]
  }[];
  isAdd?: boolean; // 是否可以点击添加（加签）
  /** 是否开启审批意见和电子签名 */
  approvalCommentConfig: {
    supportText: boolean;
    supportHandwrittenSignature: boolean;
  };
  /** 是否能指定审批人 */
  preAddSign: boolean;
}

// 路由
export interface ProcessRoute {
  query: {
    processId?: string;
    notOperates?: string;
    businessType?: string;
    isLogin?: string;
  };
}

// 获取图片
export interface ImgFile {
  accessPrefix?: string;
  businessKey?: string | null;
  id?: string;
  name?: string;
  path: string;
  refCount?: number;
  size?: number;
  suffix?: string;
  tag?: string;
  type?: string;
}
