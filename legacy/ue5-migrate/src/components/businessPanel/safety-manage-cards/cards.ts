import { type Component, defineAsyncComponent } from 'vue'

export const safety_manage_cards: Record<string, Component> = {
  // 安全管理
  "alarm-situation-statistics": defineAsyncComponent(async () => (await import('@/components/businessPanel/safety-manage-cards/safety-manage/alarm-situation-statistics/alarm-situation-statistics')).AlarmSituationStatistics), // 报警情况统计
  "hidden-danger-statistics": defineAsyncComponent(async () => (await import('@/components/businessPanel/safety-manage-cards/safety-manage/hidden-danger-statistics/hidden-danger-statistics')).HiddenDangerStatistics), // 隐患统计
  "project-record": defineAsyncComponent(async () => (await import('@/components/businessPanel/safety-manage-cards/safety-manage/project-record/project-record')).ProjectRecord), // 小散工程记录
  "inspection-statistics": defineAsyncComponent(async () => (await import('@/components/businessPanel/safety-manage-cards/safety-manage/inspection-statistics/inspection-statistics')).InspectionStatistics), // 安全巡检统计
  "safety-education-statistics": defineAsyncComponent(async () => (await import('@/components/businessPanel/safety-manage-cards/safety-manage/safety-education-statistics/safety-education-statistics')).SafetyEducationStatistics), // 安全教育统计
  "fire-equipment-statistics": defineAsyncComponent(async () => (await import('@/components/businessPanel/safety-manage-cards/safety-manage/fire-equipment-statistics/fire-equipment-statistics')).FireEquipmentStatistics), // 消防设备统计
 
}