export interface WorkTaskPageVO {
  /**
   * 应用编号
   */
  applicationCode?: string;
  /**
   * 应用名称
   */
  applicationName?: string;
  /**
   * 业务主键
   */
  businessKey?: string;
  /**
   * 业务实体信息
   */
  businessPrincipal?: string;
  /**
   * 业务状态
   */
  businessStatus?: string;
  /**
   * 业务状态名称
   */
  businessStatusName?: string;
  /**
   * 业务类型
   */
  businessType?: string;
  /**
   * 业务类型名称
   */
  businessTypeName?: string;
  /**
   * 处理时间
   */
  handlerTime?: string;
  id: number | string;
  /**
   * 下一节点状态
   */
  nextBusinessStatus?: string;
  /**
   * 下一节点状态名称
   */
  nextBusinessStatusName?: string;
  /**
   * 待办状态
   */
  status?: Status;
  /**
   * 任务删除状态
   */
  taskDelState?: boolean;
  /**
   * 任务名称
   */
  taskName?: string;
  /**
   * 任务时间
   */
  taskTime?: string;
  /**
   * 跳转地址
   */
  url?: string;
}

/**
* 待办状态
*/
export enum Status {
  Done = "DONE",
  Todo = "TODO",
}
export interface HandoverRecordVO {
  /**
   * 主键
   */
  id?: number;
  /**
   * 记录名称
   */
  recordName?: string;
  /**
   * 交班时间
   */
  shiftOverTime?: string;
  /**
   * 交班人
   */
  shiftOverUserName?: string;
  /**
   * 交班状态
   */
  status?: HandoverStatus;
  /**
   * 接班时间
   */
  takeOverTime?: string;
  /**
   * 接班人
   */
  takeOverUserName?: string;
  /**
   * 交接任务数
   */
  taskNum?: number;
  revoke?: boolean;
}

/**
* 交班状态
*/
export enum HandoverStatus {
  Cancel = "CANCEL",
  HandOvered = "HAND_OVERED",
  WaitHandover = "WAIT_HANDOVER",
}
export const HandoverStatusOptions = [
  { value: 'WAIT_HANDOVER', label: '待接班' },
  { value: 'HAND_OVERED', label: '已交班' },
]
export interface HandoverRecordDetailVO {
  /**
   * 附件
   */
  files?: FileVO[];
  shiftOverUserSign?: FileVO;
  takeOverUserSign?: FileVO;
  id?: number;
  /**
   * 备注
   */
  remarks?: string;
  /**
   * 交班任务
   */
  shiftOverTask?: TodoTaskPageVO[];
  /**
   * 交班人
   */
  shiftOverUser?: number;
  /**
   * 交班人
   */
  shiftOverUserName?: string;
}

/**
* com.guhecloud.cube.base.file.client.vo.FileVO
*
* FileVO
*/
export interface FileVO {
  /**
   * 业务主键
   */
  businessKey?: number;
  createTime?: string;
  endpointPath?: string;
  /**
   * 主键
   */
  id?: number;
  /**
   * 文件名
   */
  name?: string;
  /**
   * URL地址
   */
  path?: string;
  /**
   * 关联数量
   */
  refCount?: number;
  /**
   * 文件大小
   */
  size?: number;
  /**
   * 文件名后缀
   */
  suffix?: string;
  /**
   * 文件类型
   */
  type?: string;
}

/**
* 待办任务
*
* TodoTaskPageVO
*/
export interface TodoTaskPageVO {
  /**
   * 应用编号
   */
  applicationCode?: string;
  /**
   * 应用名称
   */
  applicationName?: string;
  /**
   * 业务主键
   */
  businessKey?: string;
  /**
   * 业务实体信息
   */
  businessPrincipal?: string;
  /**
   * 业务状态
   */
  businessStatus?: string;
  /**
   * 业务状态名称
   */
  businessStatusName?: string;
  /**
   * 业务类型
   */
  businessType?: string;
  /**
   * 业务类型名称
   */
  businessTypeName?: string;
  /**
   * 处理时间
   */
  handlerTime?: string;
  id?: number;
  /**
   * 下一节点状态
   */
  nextBusinessStatus?: string;
  /**
   * 下一节点状态名称
   */
  nextBusinessStatusName?: string;
  /**
   * 待办状态
   */
  status?: Status;
  /**
   * 任务删除状态
   */
  taskDelState?: boolean;
  /**
   * 任务名称
   */
  taskName?: string;
  /**
   * 任务时间
   */
  taskTime?: string;
  /**
   * 跳转地址
   */
  url?: string;
}
export interface TodoHomePageVO {
  /**
   * 报警任务数
   */
  alarmNum?: number;
  /**
   * 审批任务数
   */
  approveNum?: number;
  /**
   * 报警任务完成数据
   */
  doneAlarmNum?: number;
  /**
   * 审批任务完成数据
   */
  doneApproveNum?: number;
  /**
   * 普通任务完成数据
   */
  doneNormalNum?: number;
  /**
   * 已完成事项总数
   */
  doneTotalNum?: number;
  /**
   * 普通任务数
   */
  normalNum?: number;
  /**
   * 工作事项总数
   */
  totalNum?: number;
}
