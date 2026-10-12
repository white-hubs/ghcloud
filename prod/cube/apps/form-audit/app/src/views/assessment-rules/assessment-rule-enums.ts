import type { AppraisalPeriodType, CheckSourceKind } from '@ghcloud/cube-form-audit-service'

/** 考核周期（前端写死，与接口枚举一致） */
export const APPRAISAL_PERIOD_TYPE = {
  MONTHLY: 'MONTHLY',
  QUARTERLY: 'QUARTERLY',
  HALF_YEAR: 'HALF_YEAR',
} as const satisfies Record<AppraisalPeriodType, AppraisalPeriodType>

export const appraisalPeriodTypeOptions: { label: string; value: AppraisalPeriodType }[] = [
  { label: '月', value: 'MONTHLY' },
  { label: '季度', value: 'QUARTERLY' },
  { label: '半年', value: 'HALF_YEAR' },
]

const appraisalPeriodTypeLabelMap = new Map<AppraisalPeriodType, string>(
  appraisalPeriodTypeOptions.map((o) => [o.value, o.label]),
)

export function getAppraisalPeriodTypeLabel (periodType: AppraisalPeriodType | undefined | null): string {
  if (periodType === undefined || periodType === null) {
    return '--'
  }
  return appraisalPeriodTypeLabelMap.get(periodType) ?? String(periodType)
}

/** 来源：表单 / 巡检 / 维保 */
export const CHECK_SOURCE_KIND = {
  FORM: 'FORM',
  INSPECTION: 'INSPECTION',
  MAINTENANCE: 'MAINTENANCE',
} as const

export const checkSourceKindOptions: { label: string; value: CheckSourceKind }[] = [
  { label: '表单', value: CHECK_SOURCE_KIND.FORM },
  { label: '巡检', value: CHECK_SOURCE_KIND.INSPECTION },
  { label: '维保', value: CHECK_SOURCE_KIND.MAINTENANCE },
]

/** 表单来源 — 方式 */
export const FORM_METHOD_CODE = {
  RECORD_COUNT: 'RECORD_COUNT',
  FILLED_DATA: 'FILLED_DATA',
  ACCUMULATE: 'ACCUMULATE',
  AVERAGE: 'AVERAGE',
} as const

export type FormMethodCode = (typeof FORM_METHOD_CODE)[keyof typeof FORM_METHOD_CODE]

export const formMethodOptions: { label: string; value: FormMethodCode }[] = [
  { label: '记录数量', value: FORM_METHOD_CODE.RECORD_COUNT },
  { label: '填报的数据', value: FORM_METHOD_CODE.FILLED_DATA },
  { label: '累加', value: FORM_METHOD_CODE.ACCUMULATE },
  { label: '平均值', value: FORM_METHOD_CODE.AVERAGE },
]

/** 巡检来源 — 方式 */
export const PATROL_METHOD_CODE = {
  ABNORMAL_ITEM_COUNT: 'ABNORMAL_ITEM_COUNT',
  TASK_COUNT: 'TASK_COUNT',
  TIMEOUT_TASK_COUNT: 'TIMEOUT_TASK_COUNT',
} as const

export type PatrolMethodCode = (typeof PATROL_METHOD_CODE)[keyof typeof PATROL_METHOD_CODE]

export const patrolMethodOptions: { label: string; value: PatrolMethodCode }[] = [
  { label: '巡检项异常数', value: PATROL_METHOD_CODE.ABNORMAL_ITEM_COUNT },
  { label: '巡检任务完成数', value: PATROL_METHOD_CODE.TASK_COUNT },
  { label: '巡检超时任务数', value: PATROL_METHOD_CODE.TIMEOUT_TASK_COUNT },
]

/** 维保来源 — 方式 */
export const MAINTENANCE_METHOD_CODE = {
  TIMEOUT: 'TIMEOUT',
} as const

export type MaintenanceMethodCode = (typeof MAINTENANCE_METHOD_CODE)[keyof typeof MAINTENANCE_METHOD_CODE]

export const maintenanceMethodOptions: { label: string; value: MaintenanceMethodCode }[] = [
  { label: '超时任务数', value: MAINTENANCE_METHOD_CODE.TIMEOUT },
]

export function getMethodOptionsBySourceKind(
  kind: CheckSourceKind | undefined,
): { label: string; value: string }[] {
  if (kind === CHECK_SOURCE_KIND.FORM) {
    return [...formMethodOptions]
  }
  if (kind === CHECK_SOURCE_KIND.INSPECTION) {
    return [...patrolMethodOptions]
  }
  if (kind === CHECK_SOURCE_KIND.MAINTENANCE) {
    return [...maintenanceMethodOptions]
  }
  return []
}
