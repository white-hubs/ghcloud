export interface PageResult<T> {
  records: T[];
  total: number;
  pages?: number;
  current?: number;
  size?: number;
}

export interface PageQuery {
  pageNumber: number;
  pageSize: number;
}

export type CreditGrade = "A" | "B" | "C" | "D";
export type CreditStatus = "NORMAL" | "SUSPENDED";
export type BehaviorType = "PENALTY" | "BONUS" | "CHECK_OVERDUE" | "CHECK_FAKE" | "CHECK_MONTHLY_QUALIFIED";
export type BehaviorInputType = "EXTERNAL_PUSH" | "SYSTEM_GENERATED" | "MANUAL";
export type BehaviorAuditStatus = "AUTO_ACCEPTED" | "PENDING" | "APPROVED" | "REJECTED";
export type ScoreModelStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED" | "DISABLED";
export type ChecklistStatus = "DRAFT" | "PUBLISHED" | "HISTORY";
export type CheckExecutionStatus = "PENDING" | "PARTIAL_COMPLETED" | "COMPLETED" | "OVERDUE";
export type QualityStatus = "PENDING_AI" | "QUALIFIED" | "SUSPECTED_FAKE" | "CONFIRMED_FAKE";
export type QualityReviewResult = "PENDING_REVIEW" | "CONFIRMED_QUALIFIED" | "CONFIRMED_FAKE";
export type BenefitRecordStatus = "WAIT_CONFIRM" | "EFFECTIVE" | "CANCELLED";
export type SafetyCreditBenefitType =
  | "PARKING_FEE_REDUCTION"
  | "INSURANCE_DISCOUNT"
  | "CHECK_FREQUENCY_REDUCTION"
  | "PRIORITY_SERVICE"
  | "PUBLICITY_RECOMMENDATION";
export type SafetyCreditIndustryType =
  | "AGRICULTURAL_WHOLESALE"
  | "CATERING"
  | "WAREHOUSING"
  | "RETAIL"
  | "COLD_CHAIN"
  | "LOGISTICS"
  | "OTHER";

export type SafetyCreditId = string | number;
export type SafetyCreditPeriod = string;

export interface SafetyCreditMerchantVO {
  id: SafetyCreditId;
  ouaaUserId?: SafetyCreditId;
  ouaaUsername?: string;
  ouaaName?: string;
  ouaaMobile?: string;
  ouaaEnabled?: boolean;
  merchantCode: string;
  merchantName: string;
  parkName?: string;
  industryType?: SafetyCreditIndustryType;
  areaName?: string;
  stallNo?: string;
  principalName?: string;
  principalPhone?: string;
  businessScope?: string;
  remark?: string;
  currentScore?: number;
  creditGrade?: CreditGrade;
  creditStatus?: CreditStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface SafetyCreditMerchantPageQuery extends PageQuery {
  keyword?: string;
  merchantCode?: string;
  merchantName?: string;
  parkName?: string;
  industryType?: SafetyCreditIndustryType;
  creditStatus?: CreditStatus;
  areaName?: string;
  stallNo?: string;
  principalPhone?: string;
}

export interface SafetyCreditMerchantCommand {
  merchantCode: string;
  ouaaUserId?: SafetyCreditId;
  merchantName: string;
  parkName?: string;
  industryType?: SafetyCreditIndustryType;
  areaName?: string;
  stallNo?: string;
  principalName?: string;
  principalPhone?: string;
  businessScope?: string;
  remark?: string;
}

export interface SafetyCreditOuaaUserPageQuery extends PageQuery {
  keyword?: string;
  enabled?: boolean;
}

export interface SafetyCreditOuaaUserVO {
  id: SafetyCreditId;
  username?: string;
  name?: string;
  mobile?: string;
  enabled?: boolean;
  organizationNames?: string[];
  positionNames?: string[];
  appointmentNames?: string[];
  roleNames?: string[];
}

export interface SafetyCreditOuaaOrganizationVO {
  id: SafetyCreditId;
  name: string;
  enabled?: boolean;
  children?: SafetyCreditOuaaOrganizationVO[];
}

export interface SafetyCreditOuaaPositionVO {
  id: SafetyCreditId;
  name: string;
  enabled?: boolean;
}

export interface SafetyCreditOuaaAppointmentVO {
  id: SafetyCreditId;
  name: string;
  enable?: boolean;
}

export interface SafetyCreditOuaaRoleVO {
  id: SafetyCreditId;
  name: string;
  enabled?: boolean;
}

export interface SafetyCreditMerchantImportResultVO {
  successCount: number;
  failureCount: number;
  failures: Array<{
    rowNumber?: number;
    merchantCode?: string;
    reason?: string;
  }>;
}

export interface SafetyCreditDataSourcePageQuery extends PageQuery {
  keyword?: string;
  applicationCode?: string;
  applicationName?: string;
  enabled?: boolean;
}

export interface SafetyCreditOuaaApplicationPageQuery extends PageQuery {
  keyword?: string;
  enabled?: boolean;
}

export interface SafetyCreditOuaaApplicationVO {
  id: SafetyCreditId;
  code: string;
  name: string;
  enabled?: boolean;
  applicationGroupName?: string;
}

export interface SafetyCreditEventMappingVO {
  id?: SafetyCreditId;
  sourceApplicationId?: SafetyCreditId;
  applicationCode?: string;
  applicationName?: string;
  eventId: string;
  eventName: string;
  defaultScore: number;
  lastPushTime?: string;
}

export interface SafetyCreditSourceEventPageQuery extends PageQuery {
  keyword?: string;
  applicationCode?: string;
  eventId?: string;
  eventName?: string;
  enabled?: boolean;
}

export interface SafetyCreditDataSourceVO {
  id: SafetyCreditId;
  applicationCode: string;
  applicationName: string;
  defaultScore: number;
  enabled: boolean;
  eventCount?: number;
  lastPushTime?: string;
  eventMappings?: SafetyCreditEventMappingVO[];
}

export interface SafetyCreditDataSourceEnabledCommand {
  enabled: boolean;
}

export interface SafetyCreditEventMappingCommand {
  eventId?: string;
  eventName: string;
  defaultScore: number;
}

export interface SafetyCreditDataSourceCommand {
  applicationCode: string;
  applicationName: string;
  defaultScore: number;
  enabled?: boolean;
}

export interface SafetyCreditEventMappingsCommand {
  eventMappings: SafetyCreditEventMappingCommand[];
}

export interface SafetyCreditScoreModelPageQuery extends PageQuery {
  modelName?: string;
  parkName?: string;
  industryType?: SafetyCreditIndustryType;
  status?: ScoreModelStatus;
}

export interface SafetyCreditScoreWeightRule {
  applicationCode?: string;
  eventId: string;
  eventName?: string;
  behaviorType: BehaviorType;
  scoreChange: number;
  remark?: string;
}

export interface SafetyCreditGradeThreshold {
  grade: CreditGrade;
  minScore: number;
  maxScore: number;
  remark?: string;
}

export interface SafetyCreditChecklistBaseItem {
  itemCode?: string;
  itemName: string;
  category?: string;
  industryType?: SafetyCreditIndustryType;
  required?: boolean;
  remark?: string;
}

export interface SafetyCreditScoreModelVO {
  id: SafetyCreditId;
  modelName: string;
  parkName?: string;
  industryType: SafetyCreditIndustryType;
  status: ScoreModelStatus;
  currentVersion?: number | string;
  editableVersionId?: SafetyCreditId;
  editableVersionNo?: string;
  weightJson?: string;
  gradeThresholdJson?: string;
  baseCheckItemJson?: string;
  publishedTime?: string;
}

export interface SafetyCreditScoreModelCommand {
  modelName: string;
  parkName?: string;
  industryType: SafetyCreditIndustryType;
  weightJson?: string;
  gradeThresholdJson?: string;
  baseCheckItemJson?: string;
}

export interface SafetyCreditScoreModelVersionVO {
  id: SafetyCreditId;
  modelId: SafetyCreditId;
  versionNo: number | string;
  status?: ScoreModelStatus;
  weightJson?: string;
  gradeThresholdJson?: string;
  baseCheckItemJson?: string;
  publishedTime?: string;
}

export interface CreditWeightSuggestionInput {
  modelId?: SafetyCreditId;
  industryType?: SafetyCreditIndustryType;
  currentWeightsJson?: string;
  behaviorSummary?: string;
  violationSummary?: string;
}

export interface CreditWeightSuggestionItem {
  sourceApplication?: string;
  eventType?: string;
  defaultScore?: number;
  recommendedScore?: number;
  confidence?: number;
}

export interface CreditWeightSuggestionOutput {
  suggestions: CreditWeightSuggestionItem[];
  summary: string;
}

export interface SafetyCreditScoreLogPageQuery extends PageQuery {
  merchantId?: SafetyCreditId;
  merchantName?: string;
  industryType?: SafetyCreditIndustryType;
  scoreModelId?: SafetyCreditId;
  scoreModelVersion?: number | string;
  period?: SafetyCreditPeriod;
}

export interface SafetyCreditScoreLogVO {
  id: SafetyCreditId;
  merchantId: SafetyCreditId;
  merchantCode?: string;
  merchantName?: string;
  industryType?: SafetyCreditIndustryType;
  behaviorId?: SafetyCreditId;
  applicationCode?: string;
  applicationName?: string;
  eventId?: string;
  eventName?: string;
  businessType?: string;
  businessKey?: string;
  behaviorType?: BehaviorType;
  inputType?: BehaviorInputType;
  scoreBefore: number;
  scoreChange: number;
  scoreAfter: number;
  beforeGrade?: CreditGrade;
  afterGrade?: CreditGrade;
  scoreModelId?: SafetyCreditId;
  scoreModelVersion?: number | string;
  occurredTime: string;
  description?: string;
}

export interface SafetyCreditScoreTrendPointVO {
  month?: string;
  score?: number;
}

export interface SafetyCreditDeductTopVO {
  name?: string;
  score?: number;
}

export interface SafetyCreditMerchantScoreSummaryVO {
  scoreTrend?: SafetyCreditScoreTrendPointVO[];
  deductScore?: number;
  bonusScore?: number;
  netChange?: number;
  deductTop3?: SafetyCreditDeductTopVO[];
}

export interface SafetyCreditBehaviorPageQuery extends PageQuery {
  merchantId?: SafetyCreditId;
  merchantCode?: string;
  merchantName?: string;
  applicationCode?: string;
  applicationName?: string;
  eventId?: string;
  eventName?: string;
  businessType?: string;
  behaviorType?: BehaviorType;
  inputType?: BehaviorInputType;
  auditStatus?: BehaviorAuditStatus;
  period?: SafetyCreditPeriod;
}

export interface SafetyCreditBehaviorVO {
  id: SafetyCreditId;
  merchantId: SafetyCreditId;
  merchantCode?: string;
  merchantName?: string;
  applicationCode?: string;
  applicationName?: string;
  eventId: string;
  eventName?: string;
  businessType?: string;
  businessKey?: string;
  behaviorType: BehaviorType;
  inputType: BehaviorInputType;
  auditStatus: BehaviorAuditStatus;
  scoreChange: number;
  occurredTime: string;
  description?: string;
}

export interface SafetyCreditManualBehaviorCommand {
  merchantId: SafetyCreditId;
  eventId: string;
  behaviorType: BehaviorType;
  occurredTime: string;
  description: string;
  applicationCode?: string;
  businessType?: string;
  businessKey?: string;
}

export interface SafetyCreditBehaviorAuditPageQuery extends SafetyCreditBehaviorPageQuery {
  auditStatus?: BehaviorAuditStatus;
}

export interface SafetyCreditBehaviorRejectCommand {
  rejectReason: string;
}

export interface SafetyCreditMerchantBehaviorPageQuery extends PageQuery {
  merchantId?: SafetyCreditId;
  behaviorType?: BehaviorType;
  auditStatus?: BehaviorAuditStatus;
  period?: SafetyCreditPeriod;
}

export interface SafetyCreditArchivePageQuery extends PageQuery {
  merchantCode?: string;
  merchantName?: string;
  parkName?: string;
  industryType?: SafetyCreditIndustryType;
  creditGrade?: CreditGrade;
  creditStatus?: CreditStatus;
}

export interface SafetyCreditArchiveVO {
  merchantId: SafetyCreditId;
  merchantCode: string;
  merchantName: string;
  parkName?: string;
  industryType?: SafetyCreditIndustryType;
  areaName?: string;
  stallNo?: string;
  principalName?: string;
  principalPhone?: string;
  currentScore?: number;
  creditGrade?: CreditGrade;
  creditStatus?: CreditStatus;
  joinTime?: string;
  recentViolationCount?: number;
  checkCompletionRate?: number;
}

export interface SafetyCreditArchiveSummaryVO {
  normalCount?: number;
  suspendedCount?: number;
  monthViolationTopMerchantId?: SafetyCreditId;
  monthViolationTopMerchantName?: string;
  monthViolationTopCount?: number;
}

export interface SafetyCreditSuspendLogVO {
  id: SafetyCreditId;
  merchantId: SafetyCreditId;
  operateType?: string;
  reason?: string;
  operateTime?: string;
  createBy?: string;
}

export interface SafetyCreditArchiveDetailVO extends SafetyCreditArchiveVO {
  businessScope?: string;
  remark?: string;
  recentBehaviors?: SafetyCreditBehaviorVO[];
  recentScoreLogs?: SafetyCreditScoreLogVO[];
  suspendLogs?: SafetyCreditSuspendLogVO[];
}

export interface SafetyCreditArchiveOperationCommand {
  reason: string;
}

export interface SafetyCreditRankingPageQuery extends PageQuery {
  parkName?: string;
  industryType?: SafetyCreditIndustryType;
  creditGrade?: CreditGrade;
}

export interface SafetyCreditRankingSummaryQuery {
  parkName?: string;
  industryType?: SafetyCreditIndustryType;
  creditGrade?: CreditGrade;
}

export interface SafetyCreditRankingVO {
  rankNo: number;
  merchantId: SafetyCreditId;
  merchantCode: string;
  merchantName: string;
  parkName?: string;
  industryType?: SafetyCreditIndustryType;
  currentScore?: number;
  creditGrade?: CreditGrade;
  creditStatus?: CreditStatus;
}

export interface SafetyCreditRankingSummaryVO {
  merchantCount?: number;
  averageScore?: number;
  gradeCounts?: Record<string, number>;
}

export interface SafetyCreditPublicityConfigVO {
  id?: SafetyCreditId;
  parkName: string;
  configJson?: string;
}

export interface SafetyCreditPublicityConfigCommand {
  parkName: string;
  configJson: string;
}

export interface SafetyCreditCheckItemVO {
  id: SafetyCreditId;
  checklistId?: SafetyCreditId;
  itemName: string;
  required?: boolean;
  photoRequired?: boolean;
  sortNo?: number;
}

export interface SafetyCreditChecklistVO {
  id: SafetyCreditId;
  merchantId: SafetyCreditId;
  merchantCode?: string;
  merchantName?: string;
  checkName: string;
  status: ChecklistStatus;
  executionStatus?: CheckExecutionStatus;
  executionId?: SafetyCreditId;
  itemCount?: number;
  items?: SafetyCreditCheckItemVO[];
}

export interface SafetyCreditChecklistPageQuery extends PageQuery {
  merchantId?: SafetyCreditId;
  merchantName?: string;
  status?: ChecklistStatus;
}

export interface SafetyCreditChecklistGenerateCommand {
  merchantId?: SafetyCreditId;
  merchantIds?: SafetyCreditId[];
  checkName?: string;
}

export interface SafetyCreditChecklistSaveItem {
  id?: SafetyCreditId;
  itemName: string;
  required?: boolean;
  photoRequired?: boolean;
  sortNo?: number;
}

export interface SafetyCreditChecklistSaveCommand {
  checkName: string;
  items: SafetyCreditChecklistSaveItem[];
}

export interface SafetyCreditFileVO {
  id: SafetyCreditId;
  name?: string;
  suffix?: string;
  path?: string;
  size?: number;
  refCount?: number;
  type?: string;
  businessKey?: SafetyCreditId;
  endpointPath?: string;
  createTime?: string;
}

export interface SafetyCreditCheckPhotoVO {
  id?: SafetyCreditId;
  executionId?: SafetyCreditId;
  itemId?: SafetyCreditId;
  fileId: string;
  captureTime?: string;
  gps?: string;
  watermarkText?: string;
  qualityStatus?: QualityStatus;
  qualityReason?: string;
  file?: SafetyCreditFileVO;
}

export interface SafetyCreditCheckExecutionItemVO {
  id?: SafetyCreditId;
  executionId?: SafetyCreditId;
  itemId: SafetyCreditId;
  itemName?: string;
  required?: boolean;
  photoRequired?: boolean;
  checked?: boolean;
  remark?: string;
  photos?: SafetyCreditCheckPhotoVO[];
}

export interface SafetyCreditCheckExecutionVO {
  id: SafetyCreditId;
  merchantId: SafetyCreditId;
  merchantCode?: string;
  merchantName?: string;
  checklistId: SafetyCreditId;
  checkName?: string;
  cycleBegin?: string;
  cycleEnd?: string;
  status: CheckExecutionStatus;
  submitTime?: string;
  qualityStatus?: QualityStatus;
  reviewResult?: QualityReviewResult;
  reviewOpinion?: string;
  reviewTime?: string;
  items?: SafetyCreditCheckExecutionItemVO[];
}

export interface SafetyCreditCheckExecutionSubmitItem {
  itemId: SafetyCreditId;
  checked?: boolean;
  remark?: string;
  photos?: Array<{
    fileId: string;
    captureTime?: string;
    gps?: string;
    watermarkText?: string;
  }>;
}

export interface SafetyCreditCheckExecutionSubmitCommand {
  items: SafetyCreditCheckExecutionSubmitItem[];
}

export interface SafetyCreditCheckExecutionEnsureCommand {
  merchantId: SafetyCreditId;
}

export interface SafetyCreditCheckQualityPageQuery extends PageQuery {
  merchantId?: SafetyCreditId;
  merchantName?: string;
  qualityStatus?: QualityStatus;
}

export interface SafetyCreditCheckQualityVO {
  executionId: SafetyCreditId;
  merchantId: SafetyCreditId;
  merchantName?: string;
  checkName?: string;
  executionStatus?: CheckExecutionStatus;
  qualityStatus?: QualityStatus;
  reviewResult?: QualityReviewResult;
  reviewOpinion?: string;
  reviewTime?: string;
  submitTime?: string;
}

export interface SafetyCreditCheckQualitySummaryVO {
  totalCount?: number;
  pendingAiCount?: number;
  qualifiedCount?: number;
  suspectedFakeCount?: number;
  confirmedFakeCount?: number;
}

export interface SafetyCreditCheckQualityReviewCommand {
  reviewResult: QualityReviewResult;
  opinion?: string;
}

export interface SafetyCreditCheckStatisticsSummaryVO {
  executionCount?: number;
  completedCount?: number;
  overdueCount?: number;
  completionRate?: number;
}

export interface SafetyCreditBenefitRulePageQuery extends PageQuery {
  ruleName?: string;
  parkName?: string;
  creditGrade?: CreditGrade;
  benefitType?: SafetyCreditBenefitType;
  enabled?: boolean;
}

export interface SafetyCreditBenefitRuleVO {
  id: SafetyCreditId;
  ruleName: string;
  parkName?: string;
  creditGrade: CreditGrade;
  benefitType: SafetyCreditBenefitType;
  benefitContent: string;
  effectiveCondition?: string;
  enabled?: boolean;
}

export interface SafetyCreditBenefitRuleCommand {
  ruleName: string;
  parkName?: string;
  creditGrade: CreditGrade;
  benefitType: SafetyCreditBenefitType;
  benefitContent: string;
  effectiveCondition?: string;
  enabled?: boolean;
}

export interface SafetyCreditBenefitRecordPageQuery extends PageQuery {
  merchantId?: SafetyCreditId;
  merchantName?: string;
  creditGrade?: CreditGrade;
  status?: BenefitRecordStatus;
}

export interface SafetyCreditBenefitRecordVO {
  id: SafetyCreditId;
  merchantId: SafetyCreditId;
  merchantCode?: string;
  merchantName?: string;
  creditGrade?: CreditGrade;
  ruleId: SafetyCreditId;
  ruleName?: string;
  benefitType?: SafetyCreditBenefitType;
  benefitContent?: string;
  status: BenefitRecordStatus;
  effectiveTime?: string;
  expireTime?: string;
  operateTime?: string;
  operateRemark?: string;
}

export interface SafetyCreditBenefitRecordCreateCommand {
  merchantId: SafetyCreditId;
  ruleId: SafetyCreditId;
  effectiveTime?: string;
  operateRemark?: string;
}

export interface SafetyCreditBenefitRecordOperateCommand {
  operateRemark?: string;
}
