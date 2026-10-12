import { type Component, defineAsyncComponent } from 'vue'

export const shandong_cards: Record<string, Component> = {
  // 运维态势
  "work-order-statistics": defineAsyncComponent(async () => (await import('@/components/businessPanel/shandong-cards/cards/operation-situation/work-order-statistics/work-order-statistics')).WorkOrderStatistics), // 运维工单统计
  "fault-object-rank-top5": defineAsyncComponent(async () => (await import('@/components/businessPanel/shandong-cards/cards/operation-situation/fault-object-rank-top5/fault-object-rank-top5')).FaultObjectRankTop5), // 故障对象排行榜top5
  "fault-object-status-statistics": defineAsyncComponent(async () => (await import('@/components/businessPanel/shandong-cards/cards/operation-situation/fault-object-status-statistics/fault-object-status-statistics')).FaultObjectStatusStatistics), // 故障对象状态统计
  "maintenance-statistics": defineAsyncComponent(async () => (await import('@/components/businessPanel/shandong-cards/cards/operation-situation/maintenance-statistics/maintenance-statistics')).MaintenanceStatistics), // 维保统计
  "person-inspection-task-top5": defineAsyncComponent(async () => (await import('@/components/businessPanel/shandong-cards/cards/operation-situation/person-inspection-task-top5/person-inspection-task-top5')).PersonInspectionTaskTop5), // 人员巡检任务top5
  "inspection-abnormal-trend": defineAsyncComponent(async () => (await import('@/components/businessPanel/shandong-cards/cards/operation-situation/inspection-abnormal-trend/inspection-abnormal-trend')).InspectionAbnormalTrend), // 巡检异常趋势
 
}