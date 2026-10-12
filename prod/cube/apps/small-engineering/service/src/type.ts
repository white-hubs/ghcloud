/** 工程详情 */
export interface ProjectDetail {
  /**
   * 请示
   */
  apply?: ApplyDetail;
  /**
   * 验收
   */
  checkAccept?: FeedbackDetail;
  /**
   * 反馈
   */
  feedbackDetailList?: FeedbackDetail[] | null;
  /**
   * 工程名称
   */
  projectName?: null | string;
  /**
   * 签约
   */
  signing?: ApplyDetail;
  scheduleId: string | null;
}

/**
* 请示
*
* ApplyDetail
*
* 签约
*/
export interface ApplyDetail {
  /**
   * 发起部门
   */
  depName?: null | string;
  /**
   * 工单编号
   */
  orderNumber?: null | string;
  /**
   * 通过时间
   */
  passTime?: null | string;
  /**
   * 流程实例id
   */
  processInsId?: null | string;
  /**
   * 发起人
   */
  username?: null | string;
}

/**
* 验收
*
* FeedbackDetail
*
* com.guhecloud.cube.srv.gen.loose.works.dto.vo.ProjectDetailVO.FeedbackDetail
*/
export interface FeedbackDetail {
  /**
   * 反馈时间
   */
  feedbackTime?: null | string;
  /**
   * 验收结果
   */
  result?: null | string;
  /**
   * 进度
   */
  schedule?: number | null;
  /**
   * 反馈人
   */
  username?: null | string;
}

export interface ProjectNode {
  id: string;
  projectName: string;
  projectNum: string;
  status: string;
  partyB: string;
}

export interface ProjectApplyListVO {
  activeNodeAssignee?: string;
  activeNodeName?: string;
  /**
   * 工单编号
   */
  applyNum?: string;
  businessType?: string;
  currentTaskId?: string;
  formInstanceId?: number;
  formNo?: Record<string, unknown>;
  instanceName?: string;
  lastTaskCompletedTime?: string;
  processInstanceId?: string;
  /**
   * 小散工程名称
   */
  projectName?: string;
  startUserId?: number;
  startUserInfo?: {
    organizationId?: number | null;
    organizationName?: null | string;
    startUserId?: number | null;
    startUserName?: null | string;
  };
  startUserName?: string;
  status?: string;
  submitedTime?: string;
  variables?: {
    key?: Record<string, unknown>;
  };
}

export interface ProjectReformVO {
  activeNodeAssignee?: string;
  activeNodeName?: string;
  businessType?: string;
  createTime?: string;
  currentTaskId?: string;
  formInstanceId?: number;
  formNo?: Record<string, unknown>;
  instanceName?: string;
  lastTaskCompletedTime?: string;
  processInstanceId?: string;
  /**
   * 小散工程名称
   */
  projectName?: string;
  /**
   * 小散工程id
   */
  projectScheduleId?: string;
  /**
   * 工单编号
   */
  reformNum?: string;
  startUserId?: number;
  startUserInfo?: {
    organizationId?: number;
    organizationName?: string;
    startUserId?: number;
    startUserName?: string;
  };
  startUserName?: string;
  status?: string;
  submitedTime?: string;
  updateTime?: string;
  variables?: Record<string, unknown>;
}
export interface OSSFile {
  businessKey: string | null;
  id: string;
  name: string;
  path: string;
  refCount: number;
  size: number;
  suffix: string;
  type: string;
}
/**
 * 反馈详情
 */
export interface FeedbackDetailVo {
  id: string;
  scheduleId: string;
  schedule: number;
  operationType: string;
  acceptanceResult: string;
  description: string;
  files: string;
  hasProblem: boolean;
  problemDes: string;
  problemFiles: string;
  problemFileList: OSSFile[];
}
export interface FeedbackDetailRecord {
  /**
   * 描述
   */
  description?: string;
  /**
   * 反馈部门
   */
  FeedbackDepId?: number;
  FeedbackDepName?: string;
  /**
   * 反馈时间
   */
  feedbackTime?: string;
  id?: number;
  problemDes?: string;
  /**
   * 进度文件
   */
  problemFileList?: FileVO[];
  /**
   * 验收结果
   */
  result?: string;
  /**
   * 进度
   */
  schedule?: number;
  /**
   * 反馈人
   */
  username?: string;
}

export interface FileVO {
  /**
   * 业务主键
   */
  businessKey?: number;
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

export interface TemporaryPatrolRecordVO {
  id: string;
  name: string;
  userName: string;
  completeTime: number;
  projectName: string;
  result: string;
  remarks: string;
  imageFiles: OSSFile[];
}
