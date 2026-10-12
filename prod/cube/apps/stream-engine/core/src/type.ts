export interface Options {
  authStore: { token: string; tenant: string; };
  terminalType?: string;
}
// 当前表单权限 只读 可编辑 隐藏
export enum FormItemPermission {
  READONLY = 'R',
  EDIT = 'E',
  HIDE = 'H'
}
export interface FormPerms {
  id: string;
  perm: FormItemPermission;
  required: boolean;
  title: string;
  props: any;
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
    params?: string;
    format?: string;
    visible?: boolean;
    placeholder?: string;
    relateParams?: any;
    [key: `params${number}`]: string;
  };
}
export type FlowFormData = Record<string, any>
export interface ApprovalItem {
  title: string;
  processId: string;
  businessType?:string;
}
export interface TaskQueenType {
  ignore: { title: string; processId: string; reason: string;businessType?:string }[];
  success: { title: string; processId: string; reason?: string; }[];
  fail: { title: string; processId: string; reason: string;businessType?:string }[];
  todo: {
    businessType?: string 
    title: string; 
    processId: string; 
    formData: any; 
    approvalOpinion:{ sign: boolean; opinion: boolean; useLastSign:boolean};
      flowInstance: FormFlowInstance; }[];
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
}
export interface FormProcessInstance {
  // 发起该流程的用户 ID
  startUserId: string;
  // 当前流程状态
  status: FormProcessInstanceStatus;
  // 流程实例ID
  processInstanceId: string;
}
export enum FormProcessInstanceStatus {
  ACTIVE = 'ACTIVE',
  UNDO = 'UNDO',
  REJECTED = 'REJECT',
  FINISHED = 'FINISHED',
  REPEATED = 'REPEAT',
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
export interface FormBizFieldMapList {
  businessField: string;
  controlId: string;
}
export interface FormFieldList {
  id: string;
  name: string;
}
// 流引擎表单配置（发起的时候用）
export interface FlowForm {
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
  variables?: Record<string, string>;
}
// 审批不同意
export interface PostProcessTaskReject {
  account: string | null;
  comment: string | null;
  data: string;
  taskId: string;
  approvalOpinion?: ApprovalOpinion;
}
// 审批回退
export interface PostProcessTaskBack {
  account: string | null;
  comment: string | null;
  taskId: string;
  variables: string | null;
  approvalOpinion?: ApprovalOpinion;
}
export interface InterruptData{
  needApprovalText: boolean,
  needApprovalSign: boolean,
  imageSign: {
      path: string
      id:string
  }
}