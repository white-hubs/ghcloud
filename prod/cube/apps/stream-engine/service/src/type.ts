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
export interface StaffUser {
  id: string;
  name: string;
  organizationId: string;
  organizationName: string;
  mobile: string;
  // 性别
  genderName: string;
  // 职位 id
  appointmentId: string;
  // 职位 name
  appointmentName: string;
  // 入职日期
  inductionDate: number;
  // 员工编号
  jobNumber: string;
  // 员工角色
  roleId: string;
}
export interface UserLastSign{
  id: string;
  name: string;
  suffix: string;
  path: string;
  size: number;
  refCount: number;
  type: string;
  businessKey: string;
  endpointPath: string;
  createTime: number;
}
export interface FlowProcessVO {
  /**
   * 当前激活节点处理用户
   */
  activeNodeAssignee?: null | string;
  /**
   * 当前激活节点名称
   */
  activeNodeName?: null | string;
  /**
   * 业务类型
   */
  businessType?: null | string;
  /**
   * 创建时间
   */
  createTime?: null | string;
  /**
   * 当前用户处理的任务id
   */
  currentTaskId?: null | string;
  /**
   * 表单实例id
   */
  formInstanceId?: number | null;
  /**
   * 表单单号，未来需要解耦
   */
  formNo?: Record<string, unknown>;
  /**
   * 流程实例名称
   */
  instanceName?: null | string;
  /**
   * 最后任务完成时间
   */
  lastTaskCompletedTime?: null | string;
  organizationId?: number | null;
  organizationName?: null | string;
  /**
   * 流程实例id
   */
  processInstanceId?: null | string;
  /**
   * 启动用户id
   */
  startUserId?: number | null;
  /**
   * 启动用户信息
   */
  startUserInfo?: StartUserInfo;
  /**
   * 启动用户名称
   */
  startUserName?: null | string;
  /**
   * 流程实例的状态
   */
  status?: null | string;
  /**
   * 提交时间
   */
  submitedTime?: null | string;
  /**
   * 最后修改时间
   */
  updateTime?: null | string;
  /**
   * 变量
   */
  variables?: MapObject;
}

/**
* 启动用户信息
*
* StartUserInfo
*/
export interface StartUserInfo {
  organizationId?: number | null;
  organizationName?: null | string;
  startUserId?: number | null;
  startUserName?: null | string;
}

export interface MapObject {
  key?: Record<string, unknown>;
}
export interface FormFlowStatVO {
  userId: string;
  userName: string;
  organizationName: string;
  totalNumber: number;
  waitNumber: number;
  dealNumber: number;
  dealRate: string;
  avgWaitTime: string;
  totalWaitTime: number;
}
export interface FlowApplication {
  id: string;
  code: string;
  name: string;
  icon: string;
  remark: string;
  enabled: boolean;
  applicationGroupId: string;
  applicationGroupName: string;
  menuVOS: null;
  fileVO: null;
}