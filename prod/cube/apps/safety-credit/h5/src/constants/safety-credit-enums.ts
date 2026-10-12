import type {
  BehaviorInputType,
  BehaviorType,
  BenefitRecordStatus,
  CheckExecutionStatus,
  ChecklistStatus,
  CreditGrade,
  QualityReviewResult,
  QualityStatus,
  SafetyCreditBehaviorVO,
  SafetyCreditIndustryType,
} from "@ghcloud/cube-safety-credit-service";

import { displayText } from "@/utils/format";

export type StatusTone = "success" | "danger" | "warning" | "primary";
export type CreditGradeClass = "grade-a" | "grade-b" | "grade-c" | "grade-d";
export type BehaviorCardClass = "violation" | "bonus" | "selfcheck" | "neutral";
export type BenefitRecordClass = "active" | "inactive";
export type CheckExecutionListClass = "done" | "overdue" | "active" | "pending";
export type CreditHomeBehaviorTab = "all" | "penalty" | "bonus";
export type BehaviorFilter = "all" | "penalty" | "bonus" | "selfcheck";
export type PeriodFilter = "month" | "threeMonths" | "all";

export interface FilterChip<T extends string> {
  label: string;
  value: T;
}

const emptyLabel = "--";

function labelOf<T extends string>(labels: Record<T, string>, value?: T): string {
  return value === undefined ? emptyLabel : (labels[value] ?? value);
}

export const CREDIT_GRADE_LABELS: Record<CreditGrade, string> = {
  A: "A级",
  B: "B级",
  C: "C级",
  D: "D级",
};

export const CREDIT_GRADE_DESCRIPTIONS: Record<CreditGrade, string> = {
  A: "优秀",
  B: "良好",
  C: "关注",
  D: "风险",
};

export const CREDIT_GRADE_CLASSES: Record<CreditGrade, CreditGradeClass> = {
  A: "grade-a",
  B: "grade-b",
  C: "grade-c",
  D: "grade-d",
};

export const INDUSTRY_TYPE_LABELS: Record<SafetyCreditIndustryType, string> = {
  AGRICULTURAL_WHOLESALE: "农批",
  CATERING: "餐饮",
  WAREHOUSING: "仓储",
  RETAIL: "零售",
  COLD_CHAIN: "冷链",
  LOGISTICS: "物流",
  OTHER: "其他",
};

export const BEHAVIOR_TYPE_LABELS: Record<BehaviorType, string> = {
  PENALTY: "违规扣分",
  BONUS: "主动加分",
  CHECK_OVERDUE: "自查超期",
  CHECK_FAKE: "自查虚假",
  CHECK_MONTHLY_QUALIFIED: "月度达标",
};

export const BEHAVIOR_INPUT_TYPE_LABELS: Record<BehaviorInputType, string> = {
  EXTERNAL_PUSH: "外部推送",
  SYSTEM_GENERATED: "系统生成",
  MANUAL: "人工录入",
};

export const CHECK_EXECUTION_STATUS_LABELS: Record<CheckExecutionStatus, string> = {
  PENDING: "待处理",
  PARTIAL_COMPLETED: "部分完成",
  COMPLETED: "已完成",
  OVERDUE: "逾期",
};

export const CHECKLIST_STATUS_LABELS: Record<ChecklistStatus, string> = {
  DRAFT: "草稿",
  PUBLISHED: "发布",
  HISTORY: "历史",
};

export const CHECKLIST_STATUS_TONES: Record<ChecklistStatus, StatusTone> = {
  DRAFT: "primary",
  PUBLISHED: "success",
  HISTORY: "primary",
};

export const EXECUTABLE_CHECKLIST_STATUS: ChecklistStatus = "PUBLISHED";

export const CHECK_EXECUTION_STATUS_TONES: Record<CheckExecutionStatus, StatusTone> = {
  PENDING: "primary",
  PARTIAL_COMPLETED: "warning",
  COMPLETED: "success",
  OVERDUE: "danger",
};

export const CHECK_EXECUTION_LIST_CLASSES: Record<CheckExecutionStatus, CheckExecutionListClass> = {
  PENDING: "pending",
  PARTIAL_COMPLETED: "active",
  COMPLETED: "done",
  OVERDUE: "overdue",
};

export const QUALITY_STATUS_LABELS: Record<QualityStatus, string> = {
  PENDING_AI: "待识别",
  QUALIFIED: "合格",
  SUSPECTED_FAKE: "疑似虚假",
  CONFIRMED_FAKE: "确认虚假",
};

export const QUALITY_STATUS_TONES: Record<QualityStatus, StatusTone> = {
  PENDING_AI: "primary",
  QUALIFIED: "success",
  SUSPECTED_FAKE: "warning",
  CONFIRMED_FAKE: "danger",
};

export const QUALITY_REVIEW_RESULT_LABELS: Record<QualityReviewResult, string> = {
  PENDING_REVIEW: "待复核",
  CONFIRMED_QUALIFIED: "确认合格",
  CONFIRMED_FAKE: "确认虚假",
};

export const BENEFIT_RECORD_STATUS_LABELS: Record<BenefitRecordStatus, string> = {
  WAIT_CONFIRM: "待确认",
  EFFECTIVE: "已生效",
  CANCELLED: "已取消",
};

export const BENEFIT_RECORD_STATUS_CLASSES: Record<BenefitRecordStatus, BenefitRecordClass> = {
  WAIT_CONFIRM: "inactive",
  EFFECTIVE: "active",
  CANCELLED: "inactive",
};

export const CREDIT_HOME_BEHAVIOR_TABS: Array<FilterChip<CreditHomeBehaviorTab>> = [
  { label: "全部记录", value: "all" },
  { label: "违规扣分", value: "penalty" },
  { label: "加分记录", value: "bonus" },
];

export const PERIOD_FILTER_CHIPS: Array<FilterChip<PeriodFilter>> = [
  { label: "本月", value: "month" },
  { label: "近3月", value: "threeMonths" },
  { label: "全部", value: "all" },
];

export const BEHAVIOR_FILTER_CHIPS: Array<FilterChip<BehaviorFilter>> = [
  { label: "全部类型", value: "all" },
  { label: "违规扣分", value: "penalty" },
  { label: "主动加分", value: "bonus" },
  { label: "自查扣分", value: "selfcheck" },
];

export function creditGradeLabel(value?: CreditGrade): string {
  return labelOf(CREDIT_GRADE_LABELS, value);
}

export function creditGradeDescription(value?: CreditGrade): string {
  return labelOf(CREDIT_GRADE_DESCRIPTIONS, value);
}

export function creditGradeClass(value?: CreditGrade): CreditGradeClass {
  return value === undefined ? "grade-b" : (CREDIT_GRADE_CLASSES[value] ?? "grade-b");
}

export function industryTypeLabel(value?: SafetyCreditIndustryType): string {
  return labelOf(INDUSTRY_TYPE_LABELS, value);
}

export function behaviorTypeLabel(value?: BehaviorType): string {
  return labelOf(BEHAVIOR_TYPE_LABELS, value);
}

export function behaviorInputTypeLabel(value?: BehaviorInputType): string {
  return labelOf(BEHAVIOR_INPUT_TYPE_LABELS, value);
}

export function checkExecutionStatusLabel(value?: CheckExecutionStatus): string {
  return labelOf(CHECK_EXECUTION_STATUS_LABELS, value);
}

export function checklistStatusLabel(value?: ChecklistStatus): string {
  return labelOf(CHECKLIST_STATUS_LABELS, value);
}

export function checklistStatusTone(value?: ChecklistStatus): StatusTone {
  return value === undefined ? "primary" : (CHECKLIST_STATUS_TONES[value] ?? "primary");
}

export function checkExecutionStatusTone(value?: CheckExecutionStatus): StatusTone {
  return value === undefined ? "primary" : (CHECK_EXECUTION_STATUS_TONES[value] ?? "primary");
}

export function checkExecutionListClass(value?: CheckExecutionStatus): CheckExecutionListClass {
  return value === undefined ? "pending" : (CHECK_EXECUTION_LIST_CLASSES[value] ?? "pending");
}

export function isCheckExecutionReadonlyStatus(value?: CheckExecutionStatus): boolean {
  return value === "COMPLETED" || value === "OVERDUE";
}

export function isCheckExecutionCompletedStatus(value?: CheckExecutionStatus): boolean {
  return value === "COMPLETED";
}

export function qualityStatusLabel(value?: QualityStatus): string {
  return labelOf(QUALITY_STATUS_LABELS, value);
}

export function qualityStatusTone(value?: QualityStatus): StatusTone {
  return value === undefined ? "primary" : (QUALITY_STATUS_TONES[value] ?? "primary");
}

export function qualityReviewResultLabel(value?: QualityReviewResult): string {
  return labelOf(QUALITY_REVIEW_RESULT_LABELS, value);
}

export function benefitRecordStatusLabel(value?: BenefitRecordStatus): string {
  return labelOf(BENEFIT_RECORD_STATUS_LABELS, value);
}

export function benefitRecordStatusClass(value?: BenefitRecordStatus): BenefitRecordClass {
  return value === undefined ? "inactive" : (BENEFIT_RECORD_STATUS_CLASSES[value] ?? "inactive");
}

export function isPenaltyBehavior(record: SafetyCreditBehaviorVO): boolean {
  return (
    (record.scoreChange ?? 0) < 0 ||
    record.behaviorType === "PENALTY" ||
    record.behaviorType === "CHECK_OVERDUE" ||
    record.behaviorType === "CHECK_FAKE"
  );
}

export function isBonusBehavior(record: SafetyCreditBehaviorVO): boolean {
  return (record.scoreChange ?? 0) > 0 || record.behaviorType === "BONUS" || record.behaviorType === "CHECK_MONTHLY_QUALIFIED";
}

export function isSelfCheckDeductBehavior(record: SafetyCreditBehaviorVO): boolean {
  return record.behaviorType === "CHECK_OVERDUE" || record.behaviorType === "CHECK_FAKE";
}

export function behaviorCardClass(record: SafetyCreditBehaviorVO): BehaviorCardClass {
  if (isSelfCheckDeductBehavior(record)) {
    return "selfcheck";
  }
  if (isPenaltyBehavior(record)) {
    return "violation";
  }
  if (isBonusBehavior(record)) {
    return "bonus";
  }
  return "neutral";
}

export function behaviorKindLabel(record: SafetyCreditBehaviorVO): string {
  if (isPenaltyBehavior(record)) {
    return "违规扣分";
  }
  if (isBonusBehavior(record)) {
    return "主动加分";
  }
  return behaviorTypeLabel(record.behaviorType);
}

export function behaviorTitle(record: SafetyCreditBehaviorVO): string {
  return displayText(record.eventName ?? record.eventId ?? behaviorTypeLabel(record.behaviorType));
}

export function behaviorSubtype(record: SafetyCreditBehaviorVO): string {
  return displayText(record.eventName ?? record.eventId ?? record.businessType);
}

export function behaviorSource(record: SafetyCreditBehaviorVO): string {
  return displayText(record.applicationName ?? record.applicationCode ?? behaviorInputTypeLabel(record.inputType));
}

export function sourceInputText(record: SafetyCreditBehaviorVO): string {
  const source = behaviorSource(record);
  const input = behaviorInputTypeLabel(record.inputType);
  if (source === input || input === emptyLabel) {
    return source;
  }
  return `${source}（${input}）`;
}

export function behaviorMatchesFilter(record: SafetyCreditBehaviorVO, filter: BehaviorFilter): boolean {
  if (filter === "penalty") {
    return record.behaviorType === "PENALTY";
  }
  if (filter === "bonus") {
    return record.behaviorType === "BONUS";
  }
  if (filter === "selfcheck") {
    return isSelfCheckDeductBehavior(record);
  }
  return true;
}

export function behaviorFilterToQueryType(filter: BehaviorFilter): BehaviorType | undefined {
  if (filter === "penalty") {
    return "PENALTY";
  }
  if (filter === "bonus") {
    return "BONUS";
  }
  return undefined;
}

export function periodFilterLabel(value: PeriodFilter): string {
  if (value === "threeMonths") {
    return "近3月";
  }
  if (value === "all") {
    return "累计";
  }
  return "本月";
}
