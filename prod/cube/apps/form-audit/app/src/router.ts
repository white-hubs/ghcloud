import type { RouteRecordRaw } from 'vue-router'

export const routes: RouteRecordRaw[] = [
  {
    path: '/work-order-record',
    name: 'work-order-record',
    component: async () => (await import('@/views/work-order-record/work-order-record')).WorkOrderRecord,
  },
  {
    path: '/work-order-mine',
    name: 'work-order-mine',
    component: async () => (await import('@/views/work-order-record/work-order-record')).WorkOrderRecord
  },
  {
    path: '/form-audit-config',
    name: 'form-audit-config',
    component: async () => (await import('@/views/form-audit-config/form-audit-config')).FormAuditConfig,
  },
  {
    path: '/assessment-rules',
    name: 'assessment-rules',
    component: async () => (await import('@/views/assessment-rules/assessment-rules')).AssessmentRules,
  },
  {
    path: '/assessment-rules/add',
    name: 'assessment-rules-add',
    component: async () => (await import('@/views/assessment-rules/assessment-rule-form')).AssessmentRuleForm,
  },
  {
    path: '/assessment-rules/edit/:id',
    name: 'assessment-rules-edit',
    component: async () => (await import('@/views/assessment-rules/assessment-rule-form')).AssessmentRuleForm,
  },
  {
    path: '/assessment-rules/detail/:id',
    name: 'assessment-rules-detail',
    component: async () => (await import('@/views/assessment-rules/assessment-rule-form')).AssessmentRuleForm,
  },
  {
    path: '/assessment-scoring',
    name: 'assessment-scoring',
    component: async () => (await import('@/views/assessment-scoring/assessment-scoring')).AssessmentScoring,
  },
  {
    path: '/assessment-scoring/detail/:id',
    name: 'assessment-scoring-detail',
    component: async () => (await import('@/views/assessment-scoring/assessment-scoring-detail')).AssessmentScoringDetail,
  },
  {
    path: '/personnel-statistics',
    name: 'personnel-statistics',
    component: async () => (await import('@/views/personnel-statistics/personnel-statistics')).PersonnelStatistics,
  },
  {
    path: '/assessment-statistics',
    name: 'assessment-statistics',
    component: async () => (await import('@/views/assessment-statistics/assessment-statistics')).AssessmentStatistics,
  },
]
