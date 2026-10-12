/** 通用分页 */
export interface PageResult<T> {
  pages: number;
  records: T[];
  total: number;
}
export interface MyInspectionType {
  [key: string]: unknown;
  id: string;
  planName: string;
  name: string;
  status: string;
  isCheck: boolean;
  level: string;
  targetNum: number | string;
  validBeginTime: number | string;
  validEndTime: number | string;
  receiveNames: string;
}
export interface TaskDetailType {
  [key: string]: unknown;
  id: string;
  limitTimeJson: string;
  assistNames: string;
  name: string;
  receiveNames: string;
  createTime: number | string;
  status: string;
  targetNum: string;
  method: string;
  receiveIds: string;
  inspectionObjs: {
    targetAddress: string;
    location: string;
    inspectionId: string;
    result: string;
    staff: string;
    state: string;
    targetCategory: string;
    targetId: string;
    targetName: string;
    time: number | string;
    latAndLon: string;
    targetCode: string;
  }[];
}

/** 巡检任务详情-巡检对象分页列表（/inspect-task/inspection-obj） */
export interface TaskInspectionObjRecord {
  location: string;
  inspectionId: string;
  result: string;
  staff: string;
  state: string;
  targetCategory: string;
  targetId: string;
  targetName: string;
  time: number | string;
  latAndLon: string;
  targetCode: string;
  targetAddress: string;
  areaName?: string;
}
export interface InspectRecordVo {
  id: string;
  taskId: string;
  taskName: string;
  planId?: string;
  planName: string;
  targetCategory: string;
  targetId: string;
  targetName: string;
  status: string;
  time: number | string;
  organizationId?: string;
  organizationName: string;
  positionId?: string;
  positionName: string;
  userId: string;
  username: string;
  nickname: string;
  itemName: string;
  result: string;
  resultSource?: InspectRecordResultSource;
  remark: string;
  createTime?: number | string;
  assistNames: string;
  errValueNum?: number | string;
  areaId: string;
  areaName: string;
  recordItemVOS: InspectRecordItemVO[];
  recordToBusinessVOS: InspectRecordToBusinessVO[];
  standardVOS: StandardVOS[];
  inspectMethod: string;
  errNames: string;
  cancelFileList?: FileVO[];
  cancelReason?: string;
  cancelInspectFileList?: FileVO[];
  cancelInspectReason?: string;
  errDesc?: string;
  recordHandledManuallyPOS?: RecordHandledManuallyPO[];
}
export interface InspectRecord {
  [key: string]: unknown;
  id: number | string;
  nickname: string;
  time: number | string;
  standardVOS: StandardVOS[];
  cancelFileList: {
    businessKey: string;
    id: string;
    name: string;
    path: string;
    refCount: number;
    size: number;
    suffix: string;
    type: string;
  }[];
  cancelInspectFileList: {
    businessKey: string;
    id: string;
    name: string;
    path: string;
    refCount: number;
    size: number;
    suffix: string;
    type: string;
  }[];
  recordToBusinessVOS: RecordToBusinessVOS[];
  recordHandledManuallyPOS?: RepairRecord[]; // 处理记录
  // recordToBusinessVOS?: RelatedOrder[]; // 关联工单
}
export interface RecordToBusinessVOS {
  recordId: string;
  targetCategory: string;
  targetId: string;
  targetName: string;
  businessCategory: string;
  businessId: string;
  businessExist: boolean;
  businessName: string;
  businessStatus: string;
  businessTime: string;
  createTime: string;
}
export interface StandardVOS {
  itemVOS?: {
    itemId: string;
    itemName: string;
    itemImageFlag: true;
    itemResultId: string | number | string;
    itemResultName: string;
    itemResultValue: string;
    errorDesc: string;
    errorValueFlag: boolean;
    fileVOS: {
      businessKey: string;
      id: string;
      name: string;
      path: string;
      refCount: number | string;
      size: number | string;
      suffix: string;
      type: string;
    }[];
  }[];
  standardId: string | number | string;
  standardName: string;
  tempAddFlag: boolean;
  defaultStandard: boolean;
  code: string;
  name: string;
  id: string;
  enable: boolean;
  describe: string;
  standardItems: StandardItemType[];
}
interface RepairRecord {
  id: string;
  updateTime: string; // 处理时间
  userName: string; // 处理人
  repairStatus: string; // 处理结果
  content: string; // 处理说明
  fileList?: {
    businessKey: string;
    id: string;
    name: string;
    path: string;
    refCount: number;
    size: number;
    suffix: string;
    type: string;
  }[]; // 处理图片
}

interface RelatedOrder {
  id: string;
  businessId: string;
  businessExist: boolean;
  businessCategory: string;
  businessName: string;
  businessStatus: string;
}
export interface TaskRateResult {
  taskName: string;
  targetAllNum: number | string;
  receiveNames: string;
  rate: number | string;
  status: string;
}
export interface InspectTaskRate {
  targetAllNum: number | string;
  waitTargetNum: number | string;
  repairNum: number | string;
  repairCount: number | string;
  completedTargetNum: number | string;
  errTargetNum: number | string;
  taskRateResults: TaskRateResult[];
  recordTaskResultList: unknown[];
  total?: number;
  targetNum?: number;
}
/**
 * 统计结果
 */
export interface TaskObjCountResult {
  /**
   * 已巡检对象数
   */
  completedTargetNum: number;
  /**
   * 结果异常对象数
   */
  errTargetNum: number;
  /**
   * 已修复数
   */
  repairCount: number;
  repairNum: number;
  /**
   * 对象总数
   */
  targetAllNum?: number | null;
  /**
   * 待巡检对象数
   */
  waitTargetNum?: number | null;
}

export interface InspectStandard {
  [key: string]: unknown;
  id: string;
  nickname: string;
  name: string;
  code: string;
  time: number | string;
  taskName: string;
  taskId: string;
  targetName: string;
  targetId: string;
  recordId: string;
  standardVOS: StandardVOS[];
  childTargetNameList: { longKey: string; key: string; value: string }[];
}
export interface StandardItemType {
  alias?: string;
  content?: string;
  id: string;
  imageFlag: false;
  isRawItem?: 0;
  name?: string;
  referType?: string;
  resultId?: string;
  resultItemValue: string;
  imageResult?: string;
  defaultStandard?: boolean;
  itemTag?: string | null;
  fileIds: string[];
  isEditMore?: boolean;
  isUploadImage?: boolean;
  tempAddFlag?: boolean;
  standardId?: string;
  standardName?: string;
  itemId?: string;
  itemName?: string;
  itemImageResult?: string;
  itemResultId?: string;
  itemResultValue?: string;
  itemResultName?: string;
  errorValueFlag?: boolean;
  errorDesc?: string;
  remarkResult?: string;
  fileVOS?: {
    businessKey: string;
    ossId: string;
    id: string;
    name: string;
    path: string;
    refCount: number | string;
    size: number | string;
    suffix: string;
    type: string;
  }[];
  resultVO?: {
    code: string;
    createBy: string;
    createTime: number | string;
    deleted: boolean;
    enable: boolean;
    id: string;
    itemNames: string;
    name: string;
    options: {
      errorFlag: boolean;
      itemName: string;
      itemValue: string;
    }[];
  };
}

export interface InspectionImageAnalyzeResultItem {
  itemId?: string;
  itemName?: string;
  standardId?: string;
  standardName?: string;
  status?: "normal" | "abnormal" | "unrecognized";
  resultVO?: {
    id?: string;
    name?: string;
    options: {
      itemName: string;
      itemValue: string;
      errorFlag: boolean;
    }[];
  };
  result?: {
    id?: string;
    name?: string;
    itemName?: string;
    itemValue?: string;
    errorFlag?: boolean;
  };
  resultItemValue?: string;
  resultItemName?: string;
  imageResult?: string;
  remarkResult?: string;
  problemDesc?: string;
  problemDescription?: string;
  description?: string;
  reason?: string;
  evidence?: string;
  suggestion?: string;
  handlingSuggestion?: string;
  disposalSuggestion?: string;
  confidence?: number;
  needManualReview?: boolean;
}

export interface InspectionImageAnalyzeGroup {
  standardId?: string;
  standardName?: string;
  standardItems?: InspectionImageAnalyzeResultItem[];
  results?: InspectionImageAnalyzeResultItem[];
  items?: InspectionImageAnalyzeResultItem[];
  problemDescription?: string;
  evidence?: string;
  confidence?: number;
  needManualReview?: boolean;
}

export interface InspectionImageAnalyzeRequest {
  images: string;
  id: string;
  objId: string;
}

export interface InspectionImageAnalyzeResponse {
  targetName: string;
  images: string[];
  safetyTips?: string[];
  totalCount?: number;
  normalCount?: number;
  abnormalCount?: number;
  unrecognizedCount?: number;
  normalItems?: InspectionImageAnalyzeGroup[];
  abnormalItems?: InspectionImageAnalyzeGroup[];
  unrecognizedItems?: InspectionImageAnalyzeGroup[];
  summary?: {
    totalCount: number;
    normalCount: number;
    abnormalCount: number;
    unrecognizedCount: number;
    overallResult: "normal" | "abnormal" | "unrecognized" | "partial";
  };
  groupedResults?: InspectionImageAnalyzeGroup[];
}
export interface ScenePointVO {
  /**
   * 所属区域id
   */
  areaId?: null | string;
  /**
   * 所属区域名称
   */
  areaName?: null | string;
  /**
   * 编码
   */
  codeNum?: null | string;
  /**
   * 部门id
   */
  depId?: number | null;
  /**
   * 管理部门名称
   */
  depName?: null | string;
  /**
   * 详细地址
   */
  detailAddress?: null | string;
  /**
   * 现场点id
   */
  id?: number | null;
  /**
   * 定位
   */
  location?: null | string;
  /**
   * 名称
   */
  name?: null | string;
  /**
   * 现场点id
   */
  typeId?: number | null;
  /**
   * 现场点类型名称
   */
  typeName?: null | string;
}
export interface RecordPage {
  areaName: string;
  dailyErrNum: number | string;
  dailyList: [];
  dailyNum: number | string;
  id: string;
  organizationName: string;
  result: string;
  resultSource?: InspectRecordResultSource;
  targetCategory: string;
  targetId: string;
  targetName: string;
  temporaryErrNum: number | string;
  temporaryList: [];
  temporaryNum: number | string;
  submitStaff: string;
  name: string;
  time: number | string;
  submitTime: string;
  state: string;
  taskName: string;
  endTime: string;
  userName: string;
  itemCount: string;
  normalItemCount: string;
  abnormalItemCount: string;
}
export interface DetailRecordPage {
  id: string;
  errValueNum: number | string;
  result: string;
  resultSource?: InspectRecordResultSource;
  time: number | string;
  username: string;
  taskId: string;
  taskName: string;
  organizationName?: string;
}
export interface QrcodeEntityVO {
  /**
   * 编号
   */
  code?: null | string;
  /**
   * 实体ID
   */
  entityId?: null | string;
  targetId?: null | string;
  /**
   * 实体名称
   */
  entityName?: null | string;
  /**
   * 实体类型
   */
  entityType?: null | string;
  id?: number | null;
  /**
   * 名称
   */
  name?: null | string;
}
export enum InspectBusinessType {
  SMALL_ENGINEERING = "SMALL_ENGINEERING",
  DAILY_INSPECTION = "",
}

export interface StandardItem {
  id?: string | number | undefined;
  imageFlag?: boolean | undefined;
  name?: string | undefined;
  resultId?: string | number | null | undefined;
  resultItemValue?: string | null | undefined;
  itemTag?: string | null | undefined;
  imageResult?: string | boolean | null | undefined;
  remarkResult?: string | boolean | null | undefined;
  alias?: string | undefined;
  referType?: InspectBusinessType | string;
  isResultItem?: boolean | undefined;
}

export interface StandardTypeRefer {
  targetCategory: string | undefined;
  targetTypes: string[] | undefined;
}

export interface BatchStandardTypeRefer {
  targetCategory: string | undefined;
  targetTypeDetails:
    | {
        targetType: string | undefined;
        defaultStandard: boolean | undefined;
      }[]
    | undefined;
}

export interface BatchInspectStandard {
  name: string | undefined;
  remark?: string | undefined;
  safetyTips?: string | undefined;
  enable?: boolean | undefined;
  standardItems: StandardItem[] | undefined;
  standardTypeRefers: BatchStandardTypeRefer[] | undefined;
}

export interface BatchInspectStandardPayload {
  standards: BatchInspectStandard[];
}

export interface InspectResultItem {
  deleted: boolean;
  createBy: string;
  createTime: number | string;
  updateBy: string;
  updateTime: number | string;
  tenant: number | string;
  id: string;
  code: string;
  name: string;
  enable: boolean;
  itemNames: string;
  options: InspectResultItemOption[];
}

export interface InspectResultItemOption {
  itemName: string;
  itemValue: string;
  errorFlag: boolean;
}

export interface InspectStandardDetail {
  id: string;
  name: string;
  remark: string;
  safetyTips?: string;
  code: string;
  enable: boolean;
  defaultStandard: boolean;
  standardItems: StandardItemVo[];
  standardTypeRefers: StandardTypeRefer[];
  standardItemNames: string;
}

export interface StandardItemVo {
  id: string;
  standardId: string;
  alias: string;
  referType: string;
  code: string;
  name: string;
  resultId: string;
  resultItemValue: string;
  resultItemName: string;
  remarkResult: string;
  remarkResultNames: string;
  imageResult: string;
  imageResultNames: string;
  resultNames: string;
  resultVO: Record<string, unknown> | null;
  referTypeNames: string;
  itemTag: string;
}

export interface InspectItemDetail {
  id: string;
  alias: string;
  referType: string;
  code: string;
  name: string;
  resultId: string;
  resultItemValue: string;
  resultItemName: string;
  remarkResult: string | boolean;
  imageResult: string | boolean;
  resultNames: string;
  referTypeNames: string;
  resultVO: Record<string, unknown> | null;
  itemTag: string;
  imageResultNames: string;
  remarkResultNames: string;
  isResultItem?: boolean;
}
export interface ItemOptionVo {
  itemName: string;
  itemValue: string;
  errorFlag: boolean;
}

export interface ItemResultVO {
  id: string;
  code: string;
  name: string;
  enable: boolean;
  itemNames: string;
  options: ItemOptionVo[];
}
export interface InspectItemVO {
  id: string;
  alias: string;
  referType: string;
  code: string;
  name: string;
  resultId: string;
  resultItemValue: string;
  resultItemName: string;
  remarkResult: string;
  imageResult: string;
  resultNames: string;
  referTypeNames: string;
  resultVO: ItemResultVO | null;
  itemTag: string;
  imageResultNames: string;
  remarkResultNames: string;
}
export const targetCategoryOptions = [
  {
    label: "全部",
    value: "",
  },
  {
    label: "设备",
    value: "DEVICE",
  },
  {
    label: "档位",
    value: "STALL",
  },
  {
    label: "资产",
    value: "PROPERTY",
  },
  {
    label: "现场点",
    value: "SITE_POINT",
  },
  {
    label: "巡更点",
    value: "PATROL_POINT",
  },
  {
    label: "风险源",
    value: "RISK_SOURCE",
  },
  {
    label: "小散工程",
    value: "SMALL_ENGINEERING",
  },
];
export const resultOptions = [
  {
    label: "全部",
    value: "",
  },
  {
    label: "异常",
    value: "ABNORMAL",
  },
  {
    label: "正常",
    value: "NORMAL",
  },
];
export type InspectRecordResultSource = "AI" | "MANUAL";
export const inspectRecordResultSourceOptions = [
  {
    label: "AI识别",
    value: "AI",
  },
  {
    label: "人工确认",
    value: "MANUAL",
  },
];
export const inspectRecordResultSourceMap = new Map<InspectRecordResultSource, string>(
  inspectRecordResultSourceOptions.map((item) => [item.value as InspectRecordResultSource, item.label]),
);
export const taskStatusOptions = {
  ACCEPT: "待接收",
  EXECUTING: "待巡检",
  STOP: "已终止",
  OVER: "已巡检",
  WAIT_REPAIR: "待修复",
  REPAIRED: "已修复",
};
export enum InspectRecordStatus {
  ACCEPT = "ACCEPT",
  EXECUTING = "EXECUTING",
  STOP = "STOP",
  OVER = "OVER",
  WAIT_REPAIR = "WAIT_REPAIR",
  REPAIRED = "REPAIRED",
}

export const InspectRecordStatusMap = new Map([
  ["ACCEPT", "待接收"],
  ["EXECUTING", "待巡检"],
  ["STOP", "已终止"],
  ["OVER", "已巡检"],
  ["WAIT_REPAIR", "待修复"],
  ["REPAIRED", "已修复"],
]);
export const InspectStatusColor = new Map([
  ["ACCEPT", "#1d66ff"],
  ["EXECUTING", "#1d66ff"],
  ["STOP", "#969799"],
  ["OVER", "#6ab539"],
  ["WAIT_REPAIR", "#ffaa26"],
  ["REPAIRED", "#6ab539"],
]);

export const objectStatusOptions = {
  EXECUTING: "待巡检",
  WAIT_REPAIR: "待修复",
  CANCEL_REPAIR: "取消修复",
  CANCEL_INSPECT: "取消巡检",
  OVER: "已完成",
};
export const objectStatusMap = new Map([
  ["EXECUTING", "待巡检"],
  ["WAIT_REPAIR", "待修复"],
  ["CANCEL_REPAIR", "取消修复"],
  ["CANCEL_INSPECT", "取消巡检"],
  ["OVER", "已完成"],
  ["ACCEPT", "待接收"],
  ["SPLIT", "待确认"],
  ["STOP", "已终止"],
  ["EXPIRE", "已过期"],
  ["CONFIRM", "待拆解"],
  ["OVERTIME", "超时完成"],
  ["REPAIRED", "已修复"],
]);

export const objectStatusColor = new Map([
  ["EXECUTING", "#1d66ff"],
  ["WAIT_REPAIR", "#ffaa26"],
  ["CANCEL_REPAIR", "#ff4158"],
  ["CANCEL_INSPECT", "#ff4158"],
  ["OVER", "#6ab539"],
]);

export const PlanStatusOptions = {
  EXECUTING: "执行中",
  OVER: "已结束",
  STOP: "已停用",
};
export const PlanStatusMap = new Map([
  ["EXECUTING", "执行中"],
  ["OVER", "已结束"],
  ["STOP", "已停用"],
]);
export const PlanStatusColor = new Map([
  ["EXECUTING", "#1d66ff"],
  ["OVER", "#6ab539"],
  ["STOP", "#969799"],
]);
export interface RecordHandledManuallyPO {
  /**
   * 业务类型，标识该记录所属的业务场景
   */
  businessType?: string;
  /**
   * 处理内容，描述具体的修复操作或处理过程
   */
  content?: string;
  /**
   * 创建用户
   */
  createBy?: string;
  /**
   * 创建时间
   */
  createTime?: string;
  fileList?: FileVO[];
  /**
   * 主键ID
   */
  id?: number;
  /**
   * 巡检记录ID，关联巡检记录主表
   */
  recordId?: number;
  /**
   * 备注，补充说明信息
   */
  remark?: string;
  /**
   * 修复状态，例如：已修复、处理中、无法修复等
   */
  repairStatus?: string;
  tenant?: number;
  /**
   * 更新用户
   */
  updateBy?: string;
  /**
   * 更新时间
   */
  updateTime?: string;
  /**
   * 处理人ID，表示执行修复操作的用户编号
   */
  userId?: number;
  /**
   * 处理人名称，记录操作用户的姓名或登录名
   */
  userName?: string;
}
export enum RepairStatus {
  WAIT_REPAIR = "WAIT_REPAIR", // 待修复
  REPAIRED = "REPAIRED", // 已修复
  CANCEL_REPAIR = "CANCEL_REPAIR", // 取消修复
}
export const RepairStatusMap = new Map([
  ["WAIT_REPAIR", "待修复"],
  ["REPAIRED", "已修复"],
  ["CANCEL_REPAIR", "取消修复"],
]);
export const RepairStatusColor = new Map([
  ["WAIT_REPAIR", "#ffaa26"],
  ["REPAIRED", "#6ab539"],
  ["CANCEL_REPAIR", "#ff4158"],
]);
export interface InspectRecordToBusinessVO {
  /**
   * 业务分类 工单（ticket）
   */
  businessCategory?: string;
  /**
   * 业务是否存在, 可用于是否能跳转到详情
   */
  businessExist?: boolean;
  /**
   * 业务ID
   */
  businessId?: string;
  /**
   * 业务对象名称
   */
  businessName?: string;
  /**
   * 业务状态
   */
  businessStatus?: string;
  /**
   * 业务时间
   */
  businessTime?: string;
  /**
   * 创建时间
   */
  createTime?: string;
  id?: number | string;
  /**
   * 巡检记录ID
   */
  recordId?: number | string;
  /**
   * 目标对象类别
   */
  targetCategory?: string;
  /**
   * 目标对象ID
   */
  targetId?: number | string;
  /**
   * 目标对象名称
   */
  targetName?: string;
}
export interface InspectRecordItemVO {
  /**
   * 异常说明
   */
  errorDesc?: string;
  /**
   * 0 不是  1 是
   */
  errorValueFlag?: boolean;
  /**
   * 文件集合
   */
  fileVOS?: FileVO[];
  id?: number | string;
  /**
   * 巡检项ID
   */
  itemId?: number | string;
  /**
   * 要拍照的结果(NORMAL正常需要拍照，ANORMAL异常需要拍照,多个用逗号隔开)
   */
  itemImageResult?: string;
  /**
   * 巡检项名称
   */
  itemName?: string;
  /**
   * 巡检结果Id
   */
  itemResultId?: number | string;
  /**
   * 巡检项结果名称
   */
  itemResultName?: string;
  /**
   * 巡检项结果值
   */
  itemResultValue?: string;
  /**
   * 巡检项tag
   */
  itemTag?: string;
  /**
   * 巡检记录ID
   */
  recordId?: number | string;
  /**
   * 要填写备注的结果(NORMAL正常需要填写，ANORMAL异常需要填写,多个用逗号隔开)
   */
  remarkResult?: string;
  /**
   * 巡检标准ID
   */
  standardId?: number | string;
  /**
   * 巡检标准名称
   */
  standardName?: string;
  /**
   * 是否临时添加标准
   */
  tempAddFlag?: boolean;
}

export interface FileVO {
  /**
   * 业务主键
   */
  businessKey?: number | string;
  createTime?: string;
  endpointPath?: string;
  /**
   * 主键
   */
  id?: number | string;
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
  refCount?: number | string;
  /**
   * 文件大小
   */
  size?: number | string;
  /**
   * 文件名后缀
   */
  suffix?: string;
  /**
   * 文件类型
   */
  type?: string;
}
export interface InspectRecordPageExportData {
  /**
   * 异常数
   */
  abnormal?: number;
  /**
   * 取消修复数
   */
  cancelRepair?: number;
  inspectRecordList?: InspectRecordVo[];
  /**
   * 正常数
   */
  normal?: number;
  /**
   * 已巡检数
   */
  over?: number;
  /**
   * 总数
   */
  total?: number;
  /**
   * 待修复数
   */
  waitRepair?: number;
}

export interface TaskStandardAbnormalRate {
  /**
   * 对象名称
   */
  targetName?: string;
  /**
   * 执行人
   */
  nickname?: string;
  /**
   * 执行时间
   */
  updateTime?: string;
  /**
   * 任务标准名称
   */
  standardName?: string;
  /**
   * 任务名称
   */
  taskName?: string;
  /**
   * 标准项个数
   */
  totalItemCount?: number;
  /**
   * 异常数
   */
  abnormalItemCount?: number;
  /**
   * 异常率
   */
  abnormalRate?: number | string;
}

export interface InspectPlanStatisticsVO {
  /**
   * 名称（计划名称或临时任务名称）
   */
  name?: string;
  /**
   * 巡检类型 id
   */
  typeId?: number;
  /**
   * 巡检类型名称
   */
  typeName?: string;
  /**
   * 任务数
   */
  taskTotal?: number;
  /**
   * 已完成任务数
   */
  completedTaskTotal?: number;
  /**
   * 待完成任务数
   */
  pendingTaskTotal?: number;
  /**
   * 对象总数
   */
  objectTotal?: number;
  /**
   * 已巡检对象数
   */
  inspectedObjectTotal?: number;
  /**
   * 待巡检对象数
   */
  pendingObjectTotal?: number;
  /**
   * 异常巡检项数
   */
  abnormalItemTotal?: number;
  /**
   * 未处理异常项数
   */
  unhandledAbnormalItemTotal?: number;
  /**
   * 已处理异常项数
   */
  handledAbnormalItemTotal?: number;
}

export interface InspectPlanStatisticsParam {
  pageNumber: number;
  pageSize: number;
  period?: string;
  typeId?: string | number;
  name?: string;
}

export interface PaginationInspectPlanStatisticsVO {
  total: number;
  pages: number;
  records: InspectPlanStatisticsVO[];
}
