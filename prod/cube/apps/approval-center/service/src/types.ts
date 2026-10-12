/** 通用分页 */
export interface PageResult<T> {
  pages: number;
  records: T[];
  total: number;
}

export interface MapObject {
  key?: Record<string, unknown>;
}

export interface WorkOrderStatisticsModel {
  //类型编码
  businessType: string;
  //工单类型
  businessTypeName: string;
  /** 表单分组名称（列表接口返回） */
  formGroupName?: string;
  //总数
  totalNumber: number;
  //处理中工单数
  processNumber: number;
  //驳回工单数
  rejectNumber: number;
  //撤销工单数
  undoNumber: number;
  //已处理工单数
  dealNumber: number;
}

export interface RowState {
  formNo: string;
  processInstanceId: string;
  startUserId: string;
  formInstanceId: number | null;
  startUserName: string;
  submitedTime: number;
  lastTaskCompletedTime: string | null;
  status: string;
  activeNodeName: string;
  currentTaskId: string;
  businessType: string;
}

export interface FileVO {
  id: string;
  name: string;
  suffix: string;
  path: string;
  size: number;
  createTime: string;
  refCount: number;
  type: string;
  businessKey: string | null;
}

export interface FormGroupTypeVO {
  id: string;
  name: string;
  businessType: string;
}
export interface FormFlowGroupVO {
  formGroupId: string;
  formGroupName: string;
  formGroupCount: number;
  formGroupFlowList: {
    id: string;
    name: string;
    businessType: string;
  }[];
}

export interface CustomFormFlowTypeVO {
  id: string;
  name: string;
  businessType: string;
  businessTypeName: string;
}

/** `/form-flow/{id}` 返回的表单字段项 */
export interface FormFieldVO {
  id: string;
  name: string;
  required?: boolean;
  fromType?: string;
}

export interface FormFlowDetailVO {
  id: string;
  name: string;
  type: string;
  typeName: string;
  status: string;
  enable: boolean;
  remark: string;
  flowKey: string;
  formKey: string;
  formGroupId: string;
  formGroupName: string;
  shortName: string;
  permissionType: string;
  customCode: string;
  businessTypeName: string;
  updateTime: string;
  businessType: string;
  publicForm: number;
  qrCodeUrl: string;
  qrImage: string;
  flowJson: string;
  formJson: string;
  /** 表单字段列表（详情接口可选返回） */
  formFieldList?: FormFieldVO[];
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

export interface WorkOrderBusinessTypeModel {
  //类型编码
  code: string;
  //工单类型
  name: string;
}
