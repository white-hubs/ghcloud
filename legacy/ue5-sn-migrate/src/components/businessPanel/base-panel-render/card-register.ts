/**
 * 卡片注册入口 卡片的key需要和cardDefinition中的code保持一致
 */

import { Component, defineAsyncComponent } from 'vue'

/** 卡片集合 */
export const CardCollective: Record<string, Component> = {
  /** 安全2.0 总览 */
  'security-market-overview': defineAsyncComponent(async () => import('@/components/businessPanel/security-overview/cards/security-market-overview.vue')),
  'security-device-count': defineAsyncComponent(async () => import('@/components/businessPanel/security-overview/cards/security-device-count.vue')),
  'security-analysis': defineAsyncComponent(async () => import('@/components/businessPanel/security-overview/cards/security-analysis.vue')),
  'security-risk-source': defineAsyncComponent(async () => import('@/components/businessPanel/security-overview/cards/security-risk-source.vue')),
  'security-manage-trend': defineAsyncComponent(async () => import('@/components/businessPanel/security-overview/cards/security-manage-trend.vue')),

  /** 安全2.0 安防监控 */
  'security-alarm-count': defineAsyncComponent(async () => import('@/components/businessPanel/security-monitoring-safty/cards/security-alarm-count.vue')),
  'security-alarm-trend': defineAsyncComponent(async () => import('@/components/businessPanel/security-monitoring-safty/cards/security-alarm-trend.vue')),
  'security-alarm-event-count': defineAsyncComponent(async () => import('@/components/businessPanel/security-monitoring-safty/cards/security-alarm-event-count.vue')),
  'security-alarm-record': defineAsyncComponent(async () => import('@/components/businessPanel/security-monitoring-safty/cards/security-alarm-record.vue')),
  'security-monitor': defineAsyncComponent(async () => import('@/components/businessPanel/security-monitoring-safty/cards/security-monitor.vue')),
  'security-monitor-device-count': defineAsyncComponent(async () => import('@/components/businessPanel/security-monitoring-safty/cards/security-monitor-device-count.vue')),
  /** 楼栋详情面板 */
  'building-introduction': defineAsyncComponent(async () => import('@/components/businessPanel/building-details/building-introduction.vue')),
  /** 图书馆管理 */
  'month-statistics':defineAsyncComponent(async () => import('@/components/businessPanel/library-management/cards/month-statistics.vue')),
  'comprehensive-statistics':defineAsyncComponent(async () => import('@/components/businessPanel/library-management/cards/comprehensive-statistics.vue')),
  'device-status-distribution':defineAsyncComponent(async () => import('@/components/businessPanel/library-management/cards/device-status-distribution.vue')),
  'borrowing-records':defineAsyncComponent(async () => import('@/components/businessPanel/library-management/cards/borrowing-records.vue')),
  'author-rank':defineAsyncComponent(async () => import('@/components/businessPanel/library-management/cards/author-rank.vue')),
  'book-rank':defineAsyncComponent(async () => import('@/components/businessPanel/library-management/cards/book-rank.vue')),
  /**
   * 访客面板卡片 */ 
  'reserve-data-view': defineAsyncComponent(async () => import('@/components/businessPanel/visor-panel/reserve-data-view.vue')),
  'new-reserve-records': defineAsyncComponent(async () => import('@/components/businessPanel/visor-panel/new-reserve-records.vue')),
  'visitor-transit-trend': defineAsyncComponent(async () => import('@/components/businessPanel/visor-panel/visitor-transit-trend.vue')),
  'use-reserve-stat': defineAsyncComponent(async () => import('@/components/businessPanel/visor-panel/use-reserve-stat.vue')),
  'notification-details-one': defineAsyncComponent(async () => import('@/components/businessPanel/visor-panel/notification-details-one.vue')),
  'notification-details-two': defineAsyncComponent(async () => import('@/components/businessPanel/visor-panel/notification-details-two.vue')),
  'notice-announcement-list': defineAsyncComponent(async () => import('@/components/businessPanel/visor-panel/notice-announcement-list.vue')),
  'news-announcement-list': defineAsyncComponent(async () => import('@/components/businessPanel/visor-panel/news-announcement-list.vue')),
  'news-details-one': defineAsyncComponent(async () => import('@/components/businessPanel/visor-panel/news-details-one.vue')),
  'news-details-two': defineAsyncComponent(async () => import('@/components/businessPanel/visor-panel/news-details-two.vue')),
  'blacklist-alarm-list': defineAsyncComponent(async () => import('@/components/businessPanel/visor-panel/blacklist-alarm-list.vue')),

  /** 小微产业园 
   * 环境监测
  */
  'overview-pm-monitoring': defineAsyncComponent(async () => import('@/components/businessPanel/environmental-monitoring/components/overviewPMMonitoring.vue')),
  'top-real-rankings': defineAsyncComponent(async () => import('@/components/businessPanel/environmental-monitoring/components/top-real-rankings.vue')),
  'air-quality-statistics': defineAsyncComponent(async () => import('@/components/businessPanel/environmental-monitoring/components/air-quality-statistics.vue')),
  'environmental-trend-analysis': defineAsyncComponent(async () => import('@/components/businessPanel/environmental-monitoring/components/environmental-trend-analysis.vue')),
  //园区管理
  'completion-status-investment-targets': defineAsyncComponent(async () => import('@/components/businessPanel/park-management/components/completion-status-investment-targets.vue')),
  'enterprise-complaint-statistics': defineAsyncComponent(async () => import('@/components/businessPanel/park-management/components/enterprise-complaint-statistics.vue')),
  'project-initiation-statistics': defineAsyncComponent(async () => import('@/components/businessPanel/park-management/components/project-initiation-statistics.vue')),
  'space-utilization-rate': defineAsyncComponent(async () => import('@/components/businessPanel/park-management/components/space-utilization-rate.vue')),
  'rental-sales-situation': defineAsyncComponent(async () => import('@/components/businessPanel/park-management/components/rental-sales-situation.vue')),
  'trend-park-rental': defineAsyncComponent(async () => import('@/components/businessPanel/park-management/components/trend-park-rental.vue')),
  /** 视频巡逻 */
  'video-patrol-statistics': defineAsyncComponent(async () => import('@/components/businessPanel/video-patrol/video-patrol-statistics.vue')),//视频巡逻统计
  'video-patrol-routes': defineAsyncComponent(async () => import('@/components/businessPanel/video-patrol/video-patrol-routes.vue')),//视频巡逻路线
  'patrol-anomaly-statistics': defineAsyncComponent(async () => import('@/components/businessPanel/video-patrol/patrol-anomaly-statistics.vue')),//巡逻异常统计
  'patrol-point-ranking-list': defineAsyncComponent(async () => import('@/components/businessPanel/video-patrol/patrol-point-ranking-list.vue')),//巡逻点位排行榜
  'distribution-patrol-time': defineAsyncComponent(async () => import('@/components/businessPanel/video-patrol/distribution-patrol-time.vue')),//巡逻时间分布
  'patrol-personnel-point-statistics': defineAsyncComponent(async () => import('@/components/businessPanel/video-patrol/patrol-personnel-point-statistics.vue')),//巡逻人员点位统计
  'patrol-route-details': defineAsyncComponent(async () => import('@/components/businessPanel/video-patrol/patrol-route-details.vue')),//巡逻路线详情
  /** 导览详情 */
  'guide-details': defineAsyncComponent(async () => import('@/components/businessPanel/video-patrol/guide-details.vue')),//导览详情
  /** 便捷通行 */
  'trend-pedestrian-flow': defineAsyncComponent(async () => import('@/components/businessPanel/convenient-access/trend-pedestrian-flow.vue')),//人流通行趋势
  'vehicle-trends': defineAsyncComponent(async () => import('@/components/businessPanel/convenient-access/vehicle-trends.vue')),//车流趋势
  'traffic-trends': defineAsyncComponent(async () => import('@/components/businessPanel/convenient-access/traffic-trends.vue')),//通行数据
  //综合安防
  'overview-security-situation': defineAsyncComponent(async () => import('@/components/businessPanel/comprehensive-protection/overview-security-situation.vue')),//安全态势总览
  'personnel-entry-situation': defineAsyncComponent(async () => import('@/components/businessPanel/comprehensive-protection/personnel-entry-situation.vue')),//人员出入情况
  'access-control-situation': defineAsyncComponent(async () => import('@/components/businessPanel/comprehensive-protection/access-control-situation.vue')),//门禁通行情况
  //园区态势
  'abnormal-traffic-trend': defineAsyncComponent(async () => import('@/components/businessPanel/park-situation/abnormal-traffic-trend.vue')),//异常通行趋势
  'real-time-indicator-trend-analysis': defineAsyncComponent(async () => import('@/components/businessPanel/environmental-monitoring/components/environmental-trend-analysis.vue')),//实时环境指标趋势分析
  'energy-trend': defineAsyncComponent(async () => import('@/components/businessPanel/energy-consumption/components/energy-trend.vue')),//综合能耗趋势
  // 管廊设备面板
  'floorPipeGalleryEquipment': defineAsyncComponent(async () => import('@/components/businessPanel/floorEquipment/floorPipeGalleryEquipment.vue')),
  // 法院庭审
  'courtTrialPanelLeft': defineAsyncComponent(async () => import('@/components/businessPanel/demo-panel/courtTrialPanel/left.vue')),
  'courtTrialPanelRight': defineAsyncComponent(async () => import('@/components/businessPanel/demo-panel/courtTrialPanel/right.vue')),
  // 法院总览
  'campus-introduction': defineAsyncComponent(async () =>  import('@/components/businessPanel/court-panel/court-overview/campus-introduction.vue')),
  'energy-carbon-emissions': defineAsyncComponent(async () =>  import('@/components/businessPanel/court-panel/court-overview/energy-carbon-emissions.vue')),
  // 法院-法庭
  'campus-security-left': defineAsyncComponent(async () =>  import('@/components/businessPanel/court-panel/campus-security/left.vue')),
  'campus-security-right': defineAsyncComponent(async () =>  import('@/components/businessPanel/court-panel/campus-security/right.vue')),
  // 法院司法空间
  'judicial-space-left': defineAsyncComponent(async () =>  import('@/components/businessPanel/court-panel/judicial-space/left.vue')),
  'judicial-space-right': defineAsyncComponent(async () =>  import('@/components/businessPanel/court-panel/judicial-space/right.vue')),
  // 法治宣传
  'legalPublicityLeft': defineAsyncComponent(async () => import('@/components/businessPanel/court-panel/legal-publicity/left.vue')),
  'legalPublicityRight': defineAsyncComponent(async () => import('@/components/businessPanel/court-panel/legal-publicity/right.vue')),
  // 司法态势总览
  'judicial-situation-overview-left': defineAsyncComponent(async () => import('@/components/businessPanel/court-panel/judicial-situation-overview/left.vue')),
  'judicial-situation-overview-right': defineAsyncComponent(async () => import('@/components/businessPanel/court-panel/judicial-situation-overview/right.vue')),
  // 民事态势
  'civilSituationLeft': defineAsyncComponent(async () => import('@/components/businessPanel/court-panel/civil-situation/left.vue')),
  'civilSituationRight': defineAsyncComponent(async () => import('@/components/businessPanel/court-panel/civil-situation/right.vue')),
  'courtBigSecurityLeftPanel': defineAsyncComponent(async () => import('@/components/businessPanel/court-panel/campus-security/courtBigSecurityLeftPanel.vue')),
  
  // 来访人员
  'visitorsLeft': defineAsyncComponent(async () => import('@/components/businessPanel/court-panel/visitors/left.vue')),
  'visitorsRight': defineAsyncComponent(async () => import('@/components/businessPanel/court-panel/visitors/right.vue')),

  // 设备详情面板
  'deviceDetailsPanel': defineAsyncComponent(async () => import('@/components/businessPanel/floorEquipment/device-details-panel.vue')),
  /** 通用组件 
  */
  'public-security-device-count': defineAsyncComponent(async () => import('@/components/businessPanel/security-overview/cards/public-security-device-count.vue')),//设备总览
  'public-offline-rate-equipment': defineAsyncComponent(async () => import('@/components/businessPanel/security-overview/cards/public-offline-rate-equipment.vue')),//设备离线率

}
