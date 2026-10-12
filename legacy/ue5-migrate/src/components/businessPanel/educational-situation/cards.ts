import { type Component, defineAsyncComponent } from 'vue'

export const educational_situation_cards: Record<string, Component> = {
  /**
   * @description: 教务态势
   */
  // 数据总览
  "edu-data-overview": defineAsyncComponent(async () => (await import('@/components/businessPanel/educational-situation/data-overview/data-overview')).dataOverview),
  // 班级人数top5
  "edu-class-number-top5": defineAsyncComponent(async () => (await import('@/components/businessPanel/educational-situation/class-number-top5/class-number-top5')).classNumberTop5),
  // 班次数量统计
  "edu-class-number-statistics": defineAsyncComponent(async () => (await import('@/components/businessPanel/educational-situation/class-number-statistics/class-number-statistics')).classNumberStatistics),
  // 培训人数占比
  "edu-training-people-proportion": defineAsyncComponent(async () => (await import('@/components/businessPanel/educational-situation/training-people-proportion/training-people-proportion')).trainingPeopleProportion),
  // 项目数量统计
  "edu-project-number-statistics": defineAsyncComponent(async () => (await import('@/components/businessPanel/educational-situation/project-number-statistics/project-number-statistics')).projectNumberStatistics),
  // 近5年班次走势分析
  "edu-class-trends-analysis": defineAsyncComponent(async () => (await import('@/components/businessPanel/educational-situation/class-trends-analysis/class-trends-analysis')).classTrendsAnalysis),
 
}