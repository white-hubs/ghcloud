// 流引擎表单配置（发起的时候用）
export interface FlowForm {
  callType:string;
  /**
   * 应用code
   */
  application: string;
  /**
   * 应用名称
   */
  applicationName: string;
  /**
   * 是否启用
   */
  enable: boolean;
  /**
   * 是否展示审批节点
   */
  autoApprovalPrinting: boolean;
  /**
   * 流程定义JSon
   */
  flowJson: string;
  /**
   * 流程Key
   */
  flowKey: string;
  /**
   * 表单字段与业务字段关联列表
   */
  formBizFieldMapList: FormBizFieldMapList[];
  /**
   * 表单定义ID
   */
  formDefinitionId: string;
  /**
   * 表单定义版本号
   */
  formDefinitionVersion: number;
  /**
   * 表单字段列表
   */
  formFieldList: FormFieldList[];
  /**
   * 表单定义json
   */
  formJson: string;
  /**
   * 表单key
   */
  formKey: string;
  id: string;
  /**
   * 表单流程名称
   */
  name: string;
  /**
   * 备注
   */
  remark: string;
  /**
   * 状态
   */
  status: string;
  /**
   * 状态名称
   */
  statusName: string;
  /**
   * 表单流程类型
   */
  type: string;
  /**
   * 表单流程类型名称
   */
  typeName: string;
  /**
   * 修改时间
   */
  updateTime: number;
  businessTypeName: string;
}
export interface OperateAlias{
  alias:string,
  code:string,
  name: string,
}

export interface FormBizFieldMapList {
  businessField: string;
  controlId: string;
}

export interface FormFieldList {
  id: string;
  name: string;
}

//当前任务的数据 （详情页用）
export interface CurrentTaskDetail {
  data: string;
  /**
   * 已经处理过的处理人
   */
  handledOfActive: string;
  /**
   * 当前taskId
   */
  id: string;
  /**
   * 当前taskKey
   */
  key: string;
  /**
   * 当前task名称
   */
  name: string;
  /**
   * 流程信息
   */
  processInstanceRunningInfo: ProcessInstanceRunningInfo;
  properties: Properties;
  /**
   * 剩余的处理人
   */
  remainderOfActive: string;
}

/**
* 流程信息
*/
export interface ProcessInstanceRunningInfo {
  outSider?:boolean;
  formPerms?:[]
  /**
   * 流程启动用户
   */
  startName:string;
  startUserId: string;
  /**
   * 流程状态
   */
  status: string;
}

export interface Properties {
  /**
   * 表单实例id
   */
  formInstanceId: string;
  formJson: string;
  processJson: string;
}
export interface FeedbackLogs  {
  feedbackInfo:string,
  feedbackUser:string 
  feedbackTime:number,
  fileVOList:any[],
}
/**
 * 应该是数组对象集合类型
 */
export interface ProcessHistoricalPath {
  /**
   * 预分配人，此项有值说明当前不是活跃节点
   */
  assigneeList: AssigneUser[];
  feedbackLogs: FeedbackLogs[];
  /**
   * 节点id
   */
  /**
   * 节点唯一标识
   */
  nodeKey: string;
  /**
   * 节点名称
   */
  nodeName: string;
  selectRange:{
    type:string,
    ids:string[]
    typeName?:string

  }|null;
  selfSelect:boolean|null;
  taskOperations: TaskOperations[];
  /** 是否开启审批意见和电子签名 */
  approvalCommentConfig:{
    supportText:boolean;
    supportHandwrittenSignature:boolean;
  },
  /** 是否能指定审批人 */
  preAddSign:boolean;
}
interface AssigneUser {
  id: string;
  name: string;
  preReduceSign: string;
}
interface TaskOperations {
  /**
   * 当前节点的操作历史
   */
  operation: Operation;
  /**
   * 剩余任务处理人
   */
  residualOperator: ResidualOperator;
  /**
   * 当前节点的评论
   */
  feedbackLogs: FeedbackLogs[];
}
interface Operation {
  /**
   * 审批意见对象
   */
  approvalOpinion:  {text: string, attachmentIds: any[], sign: string};
  /**
   * 创建时间
   */
  createTime: string;
  /**
   * 操作人
   */
  operator: Operator;
  /**
   * 任务操作枚举
   */
  type: string;
}

/**
* 操作人
*/
interface Operator {
  /**
   * 操作人id
   */
  id: string;
  /**
   * 操作人名称
   */
  name: string;
  /**
   * 减签标识，为false表示不能减签
   */
  preReduceSign: string;
}

/**
* 剩余任务处理人
*/
interface ResidualOperator {
  id: string;
  name: string;
  preReduceSign: string;
}

export interface ApprovalHistoryInfo {
  /**
   * 完成时间
   */
  completeTime: string;
  /**
   * 操作用户姓名
   */
  name: string;
  /**
   * 审核意见
   */
  opinionText: string;
  /**
   * 审批结果，PASS： 通过 REJECT：拒绝
   */
  result: string;
}

export interface AssigneeUserInfo {
  /**
   * 头像
   */
  headImage: string;
  /**
   * 用户id
   */
  id: string;
  /**
   * 用户名称
   */
  name: string;
}

export enum TaskOperationType {
  Approval = "APPROVAL",
  Back = "BACK",
  Copy = "COPY",
  Repeat = "REPEAT",
  Submit = "SUBMIT",
  Undo = "UNDO",
}

//同意审批
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
export interface PostProcessTaskComplete {
  /**
   * 默认为当前用户
   */
  account: null | string;
  /**
   * 审批意见
   */
  approvalOpinion?: null | ApprovalOpinion;
  /**
   * 数据
   */
  data: string;
  /**
   * 任务结果
   */
  result: string;
  /**
   * 当前任务id
   */
  taskId: string;
  variables?: Record<string,string>;
}

//审批回退
export interface PostProcessTaskBack {
  account: string | null;
  comment: string | null;
  taskId: string;
  variables: string | null;
  approvalOpinion?: ApprovalOpinion
}

//审批不同意
export interface PostProcessTaskReject {
  account: string | null;
  comment: string | null;
  data: string;
  taskId: string;
  approvalOpinion?: ApprovalOpinion
}