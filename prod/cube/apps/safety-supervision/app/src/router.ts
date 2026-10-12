import type { Component } from 'vue'
import type { RouteRecordRaw } from 'vue-router'

/** 是否是二级市场App */
const marketApp = window.location.pathname.includes('safety-manage-market')

export const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: 'monthly-report'
  },
  {
    name: 'market-auth',
    path: '/auth',
    component: async () => (await import('@/views/market-auth/market-auth')).MarketAuth
  },
  {
    name: 'monthly-report',
    path: '/monthly-report',
    component: marketApp
      ? async (): Promise<Component> => (await import('@/views/monthly-report/market-monthly-report')).MarketMonthlyReport
      : async (): Promise<Component> => (await import('@/views/monthly-report/monthly-report')).MonthlyReport
  },
  {
    name: 'monthly-link',
    path: '/monthly-link',
    component: async () => (await import('@/views/monthly-link/monthly-link')).MonthlyLink
  },
  {
    name: 'auth-management',
    path: '/auth-management',
    component: async () => (await import('@/views/auth-management/index')).MonthlyLink
  },
  {
    name: 'safety-report',
    path: '/safety-report',
    component: async () => (await import('@/views/safety-report/safety-report')).SafetyReport
  },
  {
    name: 'rule-base',
    path: '/rule-base',
    component: async () => (await import('@/views/rule-manager/rule-base/rule-base')).RuleBase
  },
  {
    name: 'quota-base',
    path: '/quota-base',
    component: async () => (await import('@/views/rule-manager/quota-base/quota-base')).QuotaBase
  },
  {
    name: 'business-classification',
    path: '/business-classification',
    component: async () => (await import('@/views/rule-manager/business-classification/business-classification')).BusinessClassification
  },
  {
    name: 'config',
    path: '/config',
    component: async () => (await import('@/views/config/index')).Manage
  },
  {
    name: 'alarm-push',
    path: '/alarm-push',
    component: async () => (await import('@/views/alarm-push/index')).AlarmPush
  },
  {
    name: 'alarm-record',
    path: '/alarm-record',
    component: marketApp
      ? async (): Promise<Component> => (await import('@/views/alarm/alarm-record/market-index')).MarketAlarmRecord
      : async (): Promise<Component> => (await import('@/views/alarm/alarm-record/index')).AlarmRecord
  },
  {
    name: 'alarm-detail',
    path: '/alarm-detail',
    component: async () => (await import('@/views/alarm/alarm-record/alarm-detail/index')).AlarmDetail
  },
  {
    name: 'view-report',
    path: '/viewreport',
    component: async () => (await import('@/views/all/viewreport')).MonthlyReport
  },
  {
    name: 'excelViewer',
    path: '/excel-viewer',
    component: async () => (await import('@/views/all/excel-viewer')).ExcelViewer
  },
  {
    name: 'security-analysis',
    path: '/security-analysis',
    component: async () => (await import('@/views/security-analysis/security-analysis-report/security-analysis-report')).SecurityAnalysisReport
  },
  {
    name: 'security-analysis-report',
    path: '/security-analysis-report',
    component: async () => (await import('@/views/security-analysis-report/security-analysis-report')).SecurityAnalysisReport
  },
  {
    name: 'security-monthly-report',
    path: '/security-monthly-report',
    component: async () => (await import('@/views/security-manage/security-monthly-report/index')).SecurityMonthlyReport
  },
  {
    name: 'alarm-report',
    path: '/alarm-report',
    component: async () => (await import('@/views/security-report/alarm-report/index')).AlarmReport
  },
  {
    name: 'dept-report',
    path: '/dept-report',
    component: async () => (await import('@/views/security-report/dept-report/index')).DeptReport
  },
  {
    name: 'user-report',
    path: '/user-report',
    component: async () => (await import('@/views/security-report/user-report/index')).UserReport
  }
]
