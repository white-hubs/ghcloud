import type { PaginationQuery } from "@ghcloud/cube-gateway/src/pagination";

/** 通用分页 */
export interface PageResult<T> {
  pages: number;
  records: T[];
  total: number;
}

/** OUAA 部门列表查询（`/ouaa/authenticated/organizations/list`） */
export type OrganizationListQuery = PaginationQuery<{
  name: string;
  enabled: boolean;
}>;

/** OUAA 部门项 */
export interface Department {
  children: Department;
  enabled: boolean;
  id: string;
  level: number;
  members: null | string;
  name: string;
  parentId: string;
  remark: string;
  sequence: string;
}

/** 个人工单统计列表项（GET `/flow/getWordOrderStatisticsByUser` records 元素） */
export interface PersonnelWorkOrderStatisticsVO {
  id?: string;
  userName?: string;
  organizationName?: string;
  totalNumber?: number;
  waitNumber?: number;
  dealNumber?: number;
  dealRate?: string;
  avgWaitTime?: string;
}

export interface FlowProcessVO {
  activeNodeAssignee?: null | string;
  activeNodeName?: null | string;
  businessType?: null | string;
  createTime?: null | string;
  currentTaskId?: null | string;
  formInstanceId?: number | null;
  formNo?: Record<string, unknown>;
  instanceName?: null | string;
  lastTaskCompletedTime?: null | string;
  organizationId?: number | null;
  organizationName?: null | string;
  processInstanceId?: null | string;
  startUserId?: number | null;
  startUserName?: null | string;
  status?: null | string;
  submitedTime?: null | string;
  updateTime?: null | string;
}

export interface WorkOrderBusinessTypeModel {
  code: string;
  name: string;
}

/** 考核规则底稿下拉 — 巡检计划（`/maintain/inspect-plan/pageV2`） */
export interface InspectPlanDraftOptionVO {
  id: string;
  planName?: string;
  name?: string;
}

/** 考核规则底稿下拉 — 维保计划（`/maintain/select-maintenance-plan`） */
export interface MaintenancePlanDraftOptionVO {
  id: string;
  maintenancePlanName?: string;
  name?: string;
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
  /** 表单字段列表（详情接口优先使用，计分规则字段下拉） */
  formFieldList?: FormFieldVO[];
}

/** 考核周期类型（与 `/form-appraisal-rule/page` 等接口约定一致） */
export type AppraisalPeriodType = "MONTHLY" | "QUARTERLY" | "HALF_YEAR";

/** 规则内容来源类型（接口：`FORM` | `INSPECT` | `MAINTAIN`） */
export type FormAppraisalContentSourceType = "FORM" | "INSPECT" | "MAINTAIN";

/** 规则内容类型（接口：`SPOT_CHECK` | `INSPECTION`） */
export type FormAppraisalContentType = "SPOT_CHECK" | "INSPECTION";

/** 考核记录状态（分页与详情） */
export type FormAppraisalRecordStatus = "GENERATED" | "ADJUSTED" | "CONFIRMED";

/** 考核评分记录分页列表项（GET `/form-appraisal-record/page` → `records` 元素） */
export interface FormAppraisalRecordPageVO {
  id?: string;
  name?: string;
  inspectionItem?: string;
  periodType?: AppraisalPeriodType;
  assessmentYear?: number;
  assessmentPeriod?: number;
  assessmentBeginTime?: string;
  assessmentEndTime?: string;
  responsibleDepartmentIds?: string;
  responsibleDepartmentNames?: string;
  firstLevelFormGroupId?: string;
  firstLevelFormGroupName?: string;
  secondLevelFormGroupId?: string;
  secondLevelFormGroupName?: string;
  originTotalScore?: number;
  finalTotalScore?: number;
  originSpotCheckScore?: number;
  finalSpotCheckScore?: number;
  originInspectionScore?: number;
  finalInspectionScore?: number;
  status?: FormAppraisalRecordStatus;
  generatedAt?: string;
}

export interface FormAppraisalRecordGroupVO {
  formGroupId?: string;
  formGroupName?: string;
  level?: number;
  children?: FormAppraisalRecordGroupVO[];
  records?: FormAppraisalRecordPageVO[];
}

/** 明细计分方式 */
export type FormAppraisalRecordDetailCalcType = "FORM_COUNT" | "FIELD_VALUE" | "FIELD_SUM";

/** 考核记录详情 — 明细行（`details` 元素） */
export interface FormAppraisalRecordDetailItemVO {
  id?: string;
  contentType?: FormAppraisalContentType;
  sourceType?: FormAppraisalContentSourceType;
  sourceRefId?: string;
  sourceRefCode: string;
  sourceRefName?: string;
  contentDesc?: string;
  standardDesc?: string;
  itemName?: string;
  fieldKey?: string;
  fieldName?: string;
  calcType?: FormAppraisalRecordDetailCalcType | string;
  rawValue?: string;
  matchedRangeText?: string;
  deductionReason?: string;
  originDeductScore?: number;
  manualAdjustDeductScore?: number;
  finalDeductScore?: number;
  remark?: string;
  sort?: number;
}

/**
 * 考核记录详情（GET `/form-appraisal-record/{id}`）
 * 记录不存在时接口可能返回 null
 */
export interface FormAppraisalRecordDetailVO {
  id?: string;
  ruleId?: string;
  ruleVersion?: number;
  name?: string;
  inspectionItem?: string;
  periodType?: AppraisalPeriodType;
  assessmentYear?: number;
  assessmentPeriod?: number;
  assessmentBeginTime?: string;
  assessmentEndTime?: string;
  responsibleDepartmentIds?: string;
  responsibleDepartmentNames?: string;
  originTotalScore?: number;
  originSpotCheckScore?: number;
  originInspectionScore?: number;
  overrideFinalTotalScore?: number;
  overrideFinalSpotCheckScore?: number;
  overrideFinalInspectionScore?: number;
  finalTotalScore?: number;
  finalSpotCheckScore?: number;
  finalInspectionScore?: number;
  status?: FormAppraisalRecordStatus;
  generatedAt?: string;
  adjustRemark?: string;
  details?: FormAppraisalRecordDetailItemVO[];
}

/** 考核规则分页列表项（`/form-appraisal-rule/page` records 项） */
export interface FormAppraisalRulePageVO {
  id?: string;
  name?: string;
  /** 检查项目 */
  inspectionItem?: string;
  periodType?: AppraisalPeriodType;
  totalScore?: number;
  spotCheckScore?: number;
  inspectionScore?: number;
  responsibleDepartmentIds?: string[];
  responsibleDepartmentNames?: string;
  enabled?: boolean;
  ruleVersion?: number;
  updateTime?: string;
  /** 是否与考核等业务占用（删除校验，分页接口可能不返回） */
  inUse?: boolean;
}

/** 扣分区间（接口） */
export interface FormAppraisalRuleRangeConfigVO {
  startValue?: number;
  endValue?: number;
  deductScore?: number;
}

/** 规则项（接口 `items` 元素） */
export interface FormAppraisalRuleItemApiVO {
  id?: string;
  itemName?: string;
  fieldKey?: string;
  calcType?: string;
  sort?: number;
  rangeConfig?: FormAppraisalRuleRangeConfigVO[];
}

/** 规则内容块（接口 `contents` 元素） */
export interface FormAppraisalRuleContentApiVO {
  id?: string;
  contentType?: FormAppraisalContentType;
  sourceType?: FormAppraisalContentSourceType;
  sourceRefId?: string;
  sourceRefCode: string;
  sourceRefName?: string;
  contentDesc?: string;
  standardDesc?: string;
  sort?: number;
  items?: FormAppraisalRuleItemApiVO[];
}

/** 考核规则详情（GET `/form-appraisal-rule/{id}`） */
export interface FormAppraisalRuleDetailVO {
  id?: string;
  name?: string;
  inspectionItem?: string;
  formGroupId?: string;
  formGroupName?: string;
  periodType?: AppraisalPeriodType;
  totalScore?: number;
  spotCheckScore?: number;
  inspectionScore?: number;
  /** 多责任部门（新） */
  responsibleDepartmentIds?: string[];
  /** 单部门（旧接口兼容） */
  responsibleDepartmentId?: string;
  responsibleDepartmentNames?: string;
  enabled?: boolean;
  ruleVersion?: number;
  contents?: FormAppraisalRuleContentApiVO[];
}

/** 保存 — 规则项（POST/PUT body） */
export interface FormAppraisalRuleItemCommand {
  id?: string;
  itemName?: string;
  fieldKey?: string;
  calcType: string;
  sort?: number;
  rangeConfig: { startValue: number; endValue: number; deductScore: number }[];
}

/** 保存 — 内容块 */
export interface FormAppraisalRuleContentCommand {
  id?: string;
  contentType: FormAppraisalContentType;
  sourceType: FormAppraisalContentSourceType;
  sourceRefId: string;
  sourceRefCode: string;
  sourceRefName?: string;
  contentDesc: string;
  standardDesc?: string;
  sort?: number;
  items: FormAppraisalRuleItemCommand[];
}

/** 保存命令（POST `/form-appraisal-rule`、PUT `/form-appraisal-rule/{id}`） */
export interface FormAppraisalRuleSaveCommand {
  /** 更新时可选带规则 id（与路径参数一致） */
  id?: string;
  name: string;
  inspectionItem: string;
  formGroupId?: string | undefined;
  periodType: AppraisalPeriodType;
  totalScore: number;
  spotCheckScore: number;
  inspectionScore: number;
  responsibleDepartmentIds: string[];
  enabled: boolean;
  contents: FormAppraisalRuleContentCommand[];
}

/** 评分条件来源：表单 / 巡检 / 维保（与后端约定后对齐） */
export type CheckSourceKind = "FORM" | "INSPECTION" | "MAINTENANCE";

/** 单条区间分值 */
export interface ScoreRangeVO {
  start: number | null;
  end: number | null;
  score: number | null;
}

/** 条件组内单条计分规则（字段 + 方式 + 区间列表） */
export interface AssessmentRuleItemVO {
  /** 更新回传时后端规则项 id */
  id?: string;
  /** 计分规则名称，可编辑 */
  itemName?: string;
  /** 仅来源为表单时使用：表单字段 id */
  formFieldId?: string;
  /** 方式枚举 code，随来源不同含义不同 */
  methodCode: string;
  ranges: ScoreRangeVO[];
}

/** 考核统计看板 — 汇总（GET `/form-appraisal-record/statistics` → `summary`） */
export interface FormAppraisalStatisticsSummaryVO {
  /** 周期总满分 */
  originTotalScore?: number;
  /** 总实得分 */
  finalTotalScore?: number;
  /** 总扣分 */
  deductScore?: number;
}

/** 考核统计看板 — 单行周期（`records` 元素） */
export interface FormAppraisalStatisticsPeriodVO {
  assessmentYear?: number;
  periodType?: AppraisalPeriodType;
  /** 周期序号（月度 1–12，季度 1–4，半年度 1–2） */
  assessmentPeriod?: number;
  periodLabel?: string;
  assessmentBeginTime?: string;
  assessmentEndTime?: string;
  originTotalScore?: number;
  finalTotalScore?: number;
  deductScore?: number;
}

/** 考核统计看板（GET `/form-appraisal-record/statistics`） */
export interface FormAppraisalStatisticsVO {
  assessmentYear?: number;
  periodType?: AppraisalPeriodType;
  summary?: FormAppraisalStatisticsSummaryVO;
  currentPreviewGeneratedAt?: string | number;
  records?: FormAppraisalStatisticsPeriodVO[];
}

export interface SpotCheckItemVO {
  id?: string;
  sourceKey: string;
  sourceRefCode: string;
  /** 底稿关联名称，提交 contents 时写入 `sourceRefName` */
  sourceRefName?: string;
  sourceType: string;
  /** 来源：表单 / 巡检 / 维保 */
  checkSourceKind?: CheckSourceKind;
  content: string;
  standardDescription: string;
  itemDescription: string;
  standardCodes: string;
  /** 计分规则项（原「抽查项目/检查项目」位置，可多条） */
  ruleItems?: AssessmentRuleItemVO[];
}

/** 表单流程分组树 */
export interface GroupTree {
  children?: GroupTree[];
  id: string;
  level: number;
  name: string;
  parentId: string;
}

export interface FormFlowGroupVO {
  formGroupId: string;
  formGroupName: string;
  formGroupCount: number;
  children?: FormFlowGroupVO[];
  formGroupFlowList: {
    id: string;
    name: string;
    businessType: string;
  }[];
}
