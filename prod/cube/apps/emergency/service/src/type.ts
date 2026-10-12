export interface EmergencyEventTypes {
  /**
   * 编号
   */
  code: string;
  id: string;
  /**
   * 是否初始化的，true:是,false:否
   */
  initialized: boolean;
  /**
   * 名称
   */
  name: string;
  /**
   * 备注说明
   */
  remark: string;
}

/** 事件执行任务。 */
export interface EmergencyEventTaskPageVO {
  id: string;
  emergencyEventId?: string | number;
  emergencyEventFileId?: number;
  eventName?: string;
  planName?: string;
  planContentHtml?: string;
  name?: string;
  status?: "WAITING" | "EXECUTING" | "COMPLETED" | "STOPPED";
  deadline?: string;
  locationDesc?: string;
  durationMinutes?: number;
  executionContent?: string;
  equipment?: string;
  remark?: string;
  executorId?: number;
  executorName?: string;
  firstOperatedAt?: string;
  completedAt?: string;
  devices?: EmergencyEventTaskDeviceVO[];
}

export interface EmergencyEventTaskDeviceVO {
  id: number;
  deviceId?: number;
  deviceName?: string;
  deviceCode?: string;
}

export interface EmergencyEventVO {
  id: number;
  eventCode?: string;
  name?: string;
  sourceType?: "ALARM" | "FILE";
  occurredAt?: string;
  levelCode?: string;
  commanderId?: number;
  status?: string;
}

export interface EmergencyEventOperationLogVO {
  id: number;
  emergencyEventTaskId?: number;
  operationType?: string;
  operationName?: string;
  createTime?: string;
}

export interface EmergencyEventFeedbackVO {
  id: number;
  feedbackType?: "TEXT" | "IMAGE";
  content?: string;
  fileName?: string;
  filePath?: string;
  createTime?: string;
}

interface FileVO {
  businessKey: string | null;
  createTime: number;
  endpointPath: string;
  id: string;
  name: string;
  path: string;
  refCount: number;
  size: number;
  suffix: string;
  type: string;
}

/** 预案文件 */
export interface EmergencyFilePageVO {
  /**
   * 文档附件
   */
  documentFileId?: null | string;
  /**
   * 预案事件分类编号
   */
  emergencyEventTypeCode?: null | string;
  /**
   * 预案事件分类名称
   */
  emergencyEventTypeName?: null | string;
  /**
   * 文件类型主键
   */
  emergencyFileTypeId: string;
  /**
   * 文件类型名称
   */
  emergencyFileTypeName: string;
  /**
   * 到期时间
   */
  expirationDate: string;
  /**
   * 到期状态
   */
  expirationStatus: "EXPIRED" | "NORMAL";
  id: number;
  /**
   * 级别
   */
  levelCode: "IMPORTANT" | "ORDINARY";
  /**
   * 名称
   */
  name?: null | string;
  /**
   * 流程附件
   */
  processFileId?: null | string;
  /**
   * 备注
   */
  remark?: null | string;

  documentFileVOS: FileVO[];
  processFileVOS: FileVO[];
}
