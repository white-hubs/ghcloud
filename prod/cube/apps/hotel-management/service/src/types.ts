/** 通用分页 */
export interface PageResult<T> {
  pages: number;
  records: T[];
  total: number;
}


export interface HotelFlowProcessVO {
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
  /**
   * 接单状态
   */
  orderStatus?: string;
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