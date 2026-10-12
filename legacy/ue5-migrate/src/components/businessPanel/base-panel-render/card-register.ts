/**
 * 卡片注册入口 卡片的key需要和cardDefinition中的code保持一致
 */

import { Component, defineAsyncComponent } from "vue";

import { command_dispatch_cards } from "../command-dispatch-v2/cards";
import { educational_situation_cards } from "../educational-situation/cards";
import { parking_car_cards } from "../parking-car/cards";
import { people_flow_cards } from "../people-flow/cards";
import { pz_demo_cards } from "../pz-demo/cards/cards";
import { safety_manage_cards } from "../safety-manage-cards/cards";
import { shandong_cards } from "../shandong-cards/cards";
import { zhongda_heshun_cards } from "../zhongda-heshun/cards";

/** 卡片集合 */
export const CardCollective: Record<string, Component> = {
  /** 总览 */
  "safe-operation-days": defineAsyncComponent(
    async () => (await import("@/components/businessPanel/overview/cards/safe-operation-days/safe-operation-days.vue")).default,
  ), // 安全运营天数
  "overview-alarm-situation": defineAsyncComponent(
    async () => (await import("@/components/businessPanel/overview/cards/overview-alarm-situation/overview-alarm-situation.vue")).default,
  ), // 报警态势
  "device-situation": defineAsyncComponent(
    async () => (await import("@/components/businessPanel/overview/cards/device-situation/device-situation.vue")).default,
  ), // 设备态势
  "patrol-situation": defineAsyncComponent(
    async () => (await import("@/components/businessPanel/overview/cards/patrol-situation/patrol-situation.vue")).default,
  ), // 巡查态势
  "monitor-situation": defineAsyncComponent(
    async () => (await import("@/components/businessPanel/overview/cards/monitor-situation/monitor-situation.vue")).default,
  ), // 监控态势
  "monitor-personnel-statistics": defineAsyncComponent(
    async () =>
      (await import("@/components/businessPanel/overview/cards/monitor-personnel-statistics/monitor-personnel-statistics.vue")).default,
  ), // 监控人员统计
  "management-situation": defineAsyncComponent(
    async () => (await import("@/components/businessPanel/overview/cards/management-situation/management-situation.vue")).default,
  ), // 管理态势

  /** 安全2.0 总览 */
  "security-market-overview": defineAsyncComponent(
    async () => import("@/components/businessPanel/security-overview/cards/security-market-overview.vue"),
  ),
  "security-device-count": defineAsyncComponent(
    async () => import("@/components/businessPanel/security-overview/cards/security-device-count.vue"),
  ),
  "security-analysis": defineAsyncComponent(async () => import("@/components/businessPanel/security-overview/cards/security-analysis.vue")),
  "security-risk-source": defineAsyncComponent(
    async () => import("@/components/businessPanel/security-overview/cards/security-risk-source.vue"),
  ),
  "security-manage-trend": defineAsyncComponent(
    async () => import("@/components/businessPanel/security-overview/cards/security-manage-trend.vue"),
  ),

  /** 安全2.0 安防监控 */
  "security-alarm-count": defineAsyncComponent(
    async () => import("@/components/businessPanel/security-monitoring-safty/cards/security-alarm-count.vue"),
  ),
  "security-alarm-trend": defineAsyncComponent(
    async () => import("@/components/businessPanel/security-monitoring-safty/cards/security-alarm-trend.vue"),
  ),
  "security-alarm-event-count": defineAsyncComponent(
    async () => import("@/components/businessPanel/security-monitoring-safty/cards/security-alarm-event-count.vue"),
  ),
  "security-alarm-event-ratio": defineAsyncComponent(
    async () => import("@/components/businessPanel/security-monitoring-safty/cards/security-alarm-event-ratio.vue"),
  ),
  "security-alarm-record": defineAsyncComponent(
    async () => import("@/components/businessPanel/security-monitoring-safty/cards/security-alarm-record.vue"),
  ),
  "security-monitor": defineAsyncComponent(
    async () => import("@/components/businessPanel/security-monitoring-safty/cards/security-monitor.vue"),
  ),
  "security-monitor-device-count": defineAsyncComponent(
    async () => import("@/components/businessPanel/security-monitoring-safty/cards/security-monitor-device-count.vue"),
  ),

  /** 安防监控2.0 园区 */
  "alarm-statistics": defineAsyncComponent(
    async () => import("@/components/businessPanel/security/cards/alarm-statistics/alarm-statistics.vue"),
  ),
  "alarm-level-statistics": defineAsyncComponent(
    async () => import("@/components/businessPanel/security/cards/alarm-level-statistics/alarm-level-statistics.vue"),
  ),
  "patrol-abnormal-stats": defineAsyncComponent(
    async () => import("@/components/businessPanel/security/cards/patrol-abnormal-stats/patrol-abnormal-stats.vue"),
  ),

  /** 电气安全 */
  "electrical-device": defineAsyncComponent(async () => import("@/components/businessPanel/electrical/cards/electrical-device.vue")),

  /** 消防管理 */
  "fire-device-stats": defineAsyncComponent(async () => import("@/components/businessPanel/fire-control/cards/fire-device-stats.vue")),
  "fire-expired-device-stats": defineAsyncComponent(
    async () => import("@/components/businessPanel/fire-control/cards/fire-expired-device-stats.vue"),
  ),
  "fire-pipe-network": defineAsyncComponent(async () => import("@/components/businessPanel/fire-controlNew/cards/fire-pipe-network.vue")),
  "fire-device-distribution": defineAsyncComponent(
    async () => import("@/components/businessPanel/fire-controlNew/cards/fire-device-distribution.vue"),
  ),

  /** 给排水 */
  "liquid-level-display-board": defineAsyncComponent(
    async () => import("@/components/businessPanel/drain-off-water/cards/liquid-level-display-board.vue"),
  ),

  /** 动环监控 */
  "ups-work-situation": defineAsyncComponent(
    async () => import("@/components/businessPanel/environmental-new-monitor/cards/ups-work-situation.vue"),
  ),
  "environmental-device": defineAsyncComponent(
    async () => import("@/components/businessPanel/environmental-new-monitor/cards/environmental-device.vue"),
  ),

  /** 安全管理2.0  */
  "hidden-danger-statistics": defineAsyncComponent(
    async () => import("@/components/businessPanel/safety-management/cards/hidden-danger-statistics.vue"),
  ),
  "small-project-records": defineAsyncComponent(
    async () => import("@/components/businessPanel/safety-management/cards/small-project-records.vue"),
  ),
  "safety-inspection-statistics": defineAsyncComponent(
    async () => import("@/components/businessPanel/safety-management/cards/safety-inspection-statistics.vue"),
  ),
  "safety-education-statistics": defineAsyncComponent(
    async () => import("@/components/businessPanel/safety-management/cards/safety-education-statistics.vue"),
  ),
  "fire-equipment-statistics": defineAsyncComponent(
    async () => import("@/components/businessPanel/safety-management/cards/fire-equipment-statistics.vue"),
  ),

  /** 电子巡更 */
  "patrol-route": defineAsyncComponent(async () => import("@/components/businessPanel/electronicPatrol/cards/patrol-route.vue")),
  "patrol-plan": defineAsyncComponent(async () => import("@/components/businessPanel/electronicPatrol/cards/patrol-plan.vue")),
  "patrol-point-abnormal-top5": defineAsyncComponent(
    async () => import("@/components/businessPanel/electronicPatrol/cards/patrol-point-abnormal-top5.vue"),
  ),
  "patrol-point-missed-statistics": defineAsyncComponent(
    async () => import("@/components/businessPanel/electronicPatrol/cards/patrol-point-missed-statistics.vue"),
  ),
  "patrol-abnormal-event-statistics": defineAsyncComponent(
    async () => import("@/components/businessPanel/electronicPatrol/cards/patrol-abnormal-event-statistics.vue"),
  ),
  "today-patrol-statistics": defineAsyncComponent(
    async () => import("@/components/businessPanel/electronicPatrol/cards/today-patrol-statistics.vue"),
  ),
  "today-patrol-time-distribution": defineAsyncComponent(
    async () => import("@/components/businessPanel/electronicPatrol/cards/today-patrol-time-distribution.vue"),
  ),
  "patrol-point-ranking-top10": defineAsyncComponent(
    async () => import("@/components/businessPanel/electronicPatrol/cards/patrol-point-ranking-top10.vue"),
  ),
  "today-patrol-personnel-latest-position": defineAsyncComponent(
    async () => import("@/components/businessPanel/electronicPatrol/cards/today-patrol-personnel-latest-position.vue"),
  ),
  "patrol-point-ranking-top10-hk": defineAsyncComponent(
    async () => import("@/components/businessPanel/electronicPatrol/cards/patrol-point-ranking-top10-hk.vue"),
  ),
  "patrol-point-trend": defineAsyncComponent(
    async () => import("@/components/businessPanel/electronicPatrol/cards/patrol-point-trend.vue"),
  ),
  "monitoring-equipment-statistics": defineAsyncComponent(
    async () => import("@/components/businessPanel/electronicPatrol-new/cards/monitoring-equipment-statistics.vue"),
  ),
  "task-execution-status": defineAsyncComponent(
    async () => import("@/components/businessPanel/electronicPatrol-new/cards/task-execution-status.vue"),
  ),
  "patrol-route-new": defineAsyncComponent(
    async () => import("@/components/businessPanel/electronicPatrol-new/cards/patrol-route-new.vue"),
  ),
  "patrol-point-distribution": defineAsyncComponent(
    async () => import("@/components/businessPanel/electronicPatrol-new/cards/patrol-point-distribution.vue"),
  ),
  "patrol-point-abnormal-top5-new": defineAsyncComponent(
    async () => import("@/components/businessPanel/electronicPatrol-new/cards/patrol-point-abnormal-top5-new.vue"),
  ),
  "task-abnormal-record": defineAsyncComponent(
    async () => import("@/components/businessPanel/electronicPatrol-new/cards/task-abnormal-record.vue"),
  ),

  /** 楼栋详情面板 */
  "building-introduction": defineAsyncComponent(
    async () => import("@/components/businessPanel/building-details/building-introduction.vue"),
  ),
  /** 图书馆管理 */
  "month-statistics": defineAsyncComponent(async () => import("@/components/businessPanel/library-management/cards/month-statistics.vue")),
  "comprehensive-statistics": defineAsyncComponent(
    async () => import("@/components/businessPanel/library-management/cards/comprehensive-statistics.vue"),
  ),
  "device-status-distribution": defineAsyncComponent(
    async () => import("@/components/businessPanel/library-management/cards/device-status-distribution.vue"),
  ),
  "borrowing-records": defineAsyncComponent(
    async () => import("@/components/businessPanel/library-management/cards/borrowing-records.vue"),
  ),
  "author-rank": defineAsyncComponent(async () => import("@/components/businessPanel/library-management/cards/author-rank.vue")),
  "book-rank": defineAsyncComponent(async () => import("@/components/businessPanel/library-management/cards/book-rank.vue")),
  /**
   * 访客面板卡片 */
  "reserve-data-view": defineAsyncComponent(async () => import("@/components/businessPanel/visor-panel/reserve-data-view.vue")),
  "new-reserve-records": defineAsyncComponent(async () => import("@/components/businessPanel/visor-panel/new-reserve-records.vue")),
  "visitor-transit-trend": defineAsyncComponent(async () => import("@/components/businessPanel/visor-panel/visitor-transit-trend.vue")),
  "use-reserve-stat": defineAsyncComponent(async () => import("@/components/businessPanel/visor-panel/use-reserve-stat.vue")),
  "notification-details-one": defineAsyncComponent(
    async () => import("@/components/businessPanel/visor-panel/notification-details-one.vue"),
  ),
  "notification-details-two": defineAsyncComponent(
    async () => import("@/components/businessPanel/visor-panel/notification-details-two.vue"),
  ),
  "notice-announcement-list": defineAsyncComponent(
    async () => import("@/components/businessPanel/visor-panel/notice-announcement-list.vue"),
  ),
  "news-announcement-list": defineAsyncComponent(async () => import("@/components/businessPanel/visor-panel/news-announcement-list.vue")),
  "news-details-one": defineAsyncComponent(async () => import("@/components/businessPanel/visor-panel/news-details-one.vue")),
  "news-details-two": defineAsyncComponent(async () => import("@/components/businessPanel/visor-panel/news-details-two.vue")),
  "blacklist-alarm-list": defineAsyncComponent(async () => import("@/components/businessPanel/visor-panel/blacklist-alarm-list.vue")),

  /** 小微产业园
   * 环境监测
   */
  "overview-pm-monitoring": defineAsyncComponent(
    async () => import("@/components/businessPanel/environmental-monitoring/components/overviewPMMonitoring.vue"),
  ),
  "top-real-rankings": defineAsyncComponent(
    async () => import("@/components/businessPanel/environmental-monitoring/components/top-real-rankings.vue"),
  ),
  "air-quality-statistics": defineAsyncComponent(
    async () => import("@/components/businessPanel/environmental-monitoring/components/air-quality-statistics.vue"),
  ),
  "environmental-trend-analysis": defineAsyncComponent(
    async () => import("@/components/businessPanel/environmental-monitoring/components/environmental-trend-analysis.vue"),
  ),
  //园区管理
  "completion-status-investment-targets": defineAsyncComponent(
    async () => import("@/components/businessPanel/park-management/components/completion-status-investment-targets.vue"),
  ),
  "enterprise-complaint-statistics": defineAsyncComponent(
    async () => import("@/components/businessPanel/park-management/components/enterprise-complaint-statistics.vue"),
  ),
  "project-initiation-statistics": defineAsyncComponent(
    async () => import("@/components/businessPanel/park-management/components/project-initiation-statistics.vue"),
  ),
  "space-utilization-rate": defineAsyncComponent(
    async () => import("@/components/businessPanel/park-management/components/space-utilization-rate.vue"),
  ),
  "rental-sales-situation": defineAsyncComponent(
    async () => import("@/components/businessPanel/park-management/components/rental-sales-situation.vue"),
  ),
  "trend-park-rental": defineAsyncComponent(
    async () => import("@/components/businessPanel/park-management/components/trend-park-rental.vue"),
  ),
  /** 视频巡逻 */
  "video-patrol-statistics": defineAsyncComponent(
    async () => import("@/components/businessPanel/video-patrol/video-patrol-statistics.vue"),
  ), //视频巡逻统计
  "video-patrol-routes": defineAsyncComponent(async () => import("@/components/businessPanel/video-patrol/video-patrol-routes.vue")), //视频巡逻路线
  "patrol-anomaly-statistics": defineAsyncComponent(
    async () => import("@/components/businessPanel/video-patrol/patrol-anomaly-statistics.vue"),
  ), //巡逻异常统计
  "patrol-point-ranking-list": defineAsyncComponent(
    async () => import("@/components/businessPanel/video-patrol/patrol-point-ranking-list.vue"),
  ), //巡逻点位排行榜
  "distribution-patrol-time": defineAsyncComponent(
    async () => import("@/components/businessPanel/video-patrol/distribution-patrol-time.vue"),
  ), //巡逻时间分布
  "patrol-personnel-point-statistics": defineAsyncComponent(
    async () => import("@/components/businessPanel/video-patrol/patrol-personnel-point-statistics.vue"),
  ), //巡逻人员点位统计
  "patrol-route-details": defineAsyncComponent(async () => import("@/components/businessPanel/video-patrol/patrol-route-details.vue")), //巡逻路线详情
  /** 导览详情 */
  "guide-details": defineAsyncComponent(async () => import("@/components/businessPanel/video-patrol/guide-details.vue")), //导览详情
  /** 便捷通行 */
  "trend-pedestrian-flow": defineAsyncComponent(
    async () => import("@/components/businessPanel/convenient-access/trend-pedestrian-flow.vue"),
  ), //人流通行趋势
  "vehicle-trends": defineAsyncComponent(async () => import("@/components/businessPanel/convenient-access/vehicle-trends.vue")), //车流趋势
  "traffic-trends": defineAsyncComponent(async () => import("@/components/businessPanel/convenient-access/traffic-trends.vue")), //通行数据
  "stranded-vehicles-analysis": defineAsyncComponent(
    async () => import("@/components/businessPanel/convenient-access/stranded-vehicles-analysis.vue"),
  ), //滞留车辆分析
  //综合安防
  "overview-security-situation": defineAsyncComponent(
    async () => import("@/components/businessPanel/comprehensive-protection/overview-security-situation.vue"),
  ), //安全态势总览
  "personnel-entry-situation": defineAsyncComponent(
    async () => import("@/components/businessPanel/comprehensive-protection/personnel-entry-situation.vue"),
  ), //人员出入情况
  "access-control-situation": defineAsyncComponent(
    async () => import("@/components/businessPanel/comprehensive-protection/access-control-situation.vue"),
  ), //门禁通行情况
  //园区态势
  "abnormal-traffic-trend": defineAsyncComponent(
    async () => import("@/components/businessPanel/park-situation/abnormal-traffic-trend.vue"),
  ), //异常通行趋势
  "real-time-indicator-trend-analysis": defineAsyncComponent(
    async () => import("@/components/businessPanel/environmental-monitoring/components/environmental-trend-analysis.vue"),
  ), //实时环境指标趋势分析
  // 管廊设备面板
  floorPipeGalleryEquipment: defineAsyncComponent(
    async () => import("@/components/businessPanel/floorEquipment/floorPipeGalleryEquipment.vue"),
  ),
  // 法院庭审
  courtTrialPanelLeft: defineAsyncComponent(async () => import("@/components/businessPanel/demo-panel/courtTrialPanel/left.vue")),
  courtTrialPanelRight: defineAsyncComponent(async () => import("@/components/businessPanel/demo-panel/courtTrialPanel/right.vue")),
  // 法院总览
  "campus-introduction": defineAsyncComponent(
    async () => import("@/components/businessPanel/court-panel/court-overview/campus-introduction.vue"),
  ),
  "energy-carbon-emissions": defineAsyncComponent(
    async () => import("@/components/businessPanel/court-panel/court-overview/energy-carbon-emissions.vue"),
  ),
  // 法院-法庭
  "campus-security-left": defineAsyncComponent(async () => import("@/components/businessPanel/court-panel/campus-security/left.vue")),
  "campus-security-right": defineAsyncComponent(async () => import("@/components/businessPanel/court-panel/campus-security/right.vue")),
  // 法院司法空间
  "judicial-space-left": defineAsyncComponent(async () => import("@/components/businessPanel/court-panel/judicial-space/left.vue")),
  "judicial-space-right": defineAsyncComponent(async () => import("@/components/businessPanel/court-panel/judicial-space/right.vue")),
  // 法治宣传
  legalPublicityLeft: defineAsyncComponent(async () => import("@/components/businessPanel/court-panel/legal-publicity/left.vue")),
  legalPublicityRight: defineAsyncComponent(async () => import("@/components/businessPanel/court-panel/legal-publicity/right.vue")),
  // 司法态势总览
  "judicial-situation-overview-left": defineAsyncComponent(
    async () => import("@/components/businessPanel/court-panel/judicial-situation-overview/left.vue"),
  ),
  "judicial-situation-overview-right": defineAsyncComponent(
    async () => import("@/components/businessPanel/court-panel/judicial-situation-overview/right.vue"),
  ),
  // 民事态势
  civilSituationLeft: defineAsyncComponent(async () => import("@/components/businessPanel/court-panel/civil-situation/left.vue")),
  civilSituationRight: defineAsyncComponent(async () => import("@/components/businessPanel/court-panel/civil-situation/right.vue")),
  courtBigSecurityLeftPanel: defineAsyncComponent(
    async () => import("@/components/businessPanel/court-panel/campus-security/courtBigSecurityLeftPanel.vue"),
  ),

  // 来访人员
  visitorsLeft: defineAsyncComponent(async () => import("@/components/businessPanel/court-panel/visitors/left.vue")),
  visitorsRight: defineAsyncComponent(async () => import("@/components/businessPanel/court-panel/visitors/right.vue")),

  //数智公安面板
  //园区介绍
  briefIntroduction: defineAsyncComponent(async () => import("@/components/businessPanel/public-security/briefIntroduction.vue")),
  //访客预约统计
  appointmentsNumber: defineAsyncComponent(async () => import("@/components/businessPanel/public-security/appointmentsNumber.vue")),
  //访客车辆数统计
  visitorVehicles: defineAsyncComponent(async () => import("@/components/businessPanel/public-security/visitor-vehicles.vue")),
  // 报修工单统计
  "work-order-statistics": defineAsyncComponent(async () => import("@/components/businessPanel/public-security/work-order-statistics.vue")),
  // 报修区域
  "warranty-area": defineAsyncComponent(async () => import("@/components/businessPanel/public-security/warranty-area.vue")),
  // 人员清点
  personnelCounting: defineAsyncComponent(async () => import("@/components/businessPanel/personnelCounting/personnelCounting.vue")),
  // 车底监测
  vehicleMonitoring: defineAsyncComponent(async () => import("@/components/businessPanel/personnelCounting/vehicleMonitoring.vue")),
  // 人车出入总览
  "access-overview": defineAsyncComponent(async () => import("@/components/businessPanel/personnelCounting/access-overview.vue")),
  // 人员实时通行数据
  "traffic-data": defineAsyncComponent(async () => import("@/components/businessPanel/personnelCounting/traffic-data.vue")),
  // 车位总览
  "overview-parking-spaces": defineAsyncComponent(
    async () => import("@/components/businessPanel/personnelCounting/overview-parking-spaces.vue"),
  ),
  // 车流趋势
  "traffic-flow-trend": defineAsyncComponent(async () => import("@/components/businessPanel/personnelCounting/traffic-flow-trend.vue")),
  // 滞留车辆分析
  "analysis-stranded-vehicles": defineAsyncComponent(
    async () => import("@/components/businessPanel/personnelCounting/analysis-stranded-vehicles.vue"),
  ),
  // 设备详情面板
  deviceDetailsPanel: defineAsyncComponent(async () => import("@/components/businessPanel/floorEquipment/device-details-panel.vue")),
  //综合能耗分布
  "energy-distribution": defineAsyncComponent(
    async () => import("@/components/businessPanel/security-overview/cards/public-energy-distribution.vue"),
  ),
  //巡更任务统计
  "patrol-task-statistics": defineAsyncComponent(
    async () => import("@/components/businessPanel/security-monitoring-safty/cards/patrol-task-statistics.vue"),
  ),
  //群控组实时数据
  "group-control-panel": defineAsyncComponent(
    async () => import("@/components/businessPanel/intelligent-lighting/components/group-control-panel.vue"),
  ),
  TimeControlPanel: defineAsyncComponent(
    async () => import("@/components/businessPanel/intelligent-lighting/components/time-control-panel.vue"),
  ),
  /**
   * 资产管理
   */
  // 资产概览
  "asset-overview": defineAsyncComponent(async () => import("@/components/businessPanel/asset-management/asset-overview.vue")),
  // 按应用统计设备数量
  "application-device-count": defineAsyncComponent(
    async () => import("@/components/businessPanel/asset-management/application-device-statistics/application-device-count.vue"),
  ),
  // 按应用统计设备在线、离线数量
  "application-device-status": defineAsyncComponent(
    async () => import("@/components/businessPanel/asset-management/application-device-statistics/application-device-status.vue"),
  ),
  // 部门资产分布情况
  "distribution-departmental-assets": defineAsyncComponent(
    async () => import("@/components/businessPanel/asset-management/distribution-departmental-assets.vue"),
  ),
  // 区域资产分布情况
  "regional-asset-distribution": defineAsyncComponent(
    async () => import("@/components/businessPanel/asset-management/regional-asset-distribution.vue"),
  ),
  // 资产状态占比
  "proportion-asset-status": defineAsyncComponent(
    async () => import("@/components/businessPanel/asset-management/proportion-asset-status.vue"),
  ),
  // 资产分类占比
  "proportion-asset-classification": defineAsyncComponent(
    async () => import("@/components/businessPanel/asset-management/proportion-asset-classification.vue"),
  ),
  // 耗材出库趋势
  "trend-consumables-outbound": defineAsyncComponent(
    async () => import("@/components/businessPanel/asset-management/trend-consumables-outbound.vue"),
  ),
  /**
   * 设备通用卡片
   */
  // 设备故障率
  "device-offlineRate": defineAsyncComponent(
    async () => import("@/components/businessPanel/universal-panel/components/DeviceOfflineRate.vue"),
  ),
  // 设备状态总览
  "equipment-statusOverview": defineAsyncComponent(
    async () => import("@/components/businessPanel/universal-panel/components/EquipmentStatusOverview.vue"),
  ),
  // 设备状态统计
  "equipment-status": defineAsyncComponent(async () => import("@/components/businessPanel/universal-panel/components/equipmentStatus.vue")),
  // 报警级别分布
  "alarm-level": defineAsyncComponent(async () => import("@/components/businessPanel/universal-panel/components/alarm-level.vue")),
  // 事件报警Top5
  "event-alarm-top5": defineAsyncComponent(
    async () => import("@/components/businessPanel/universal-panel/components/event-alarm-top5.vue"),
  ),
  // 设备报警Top5
  "equipment-alarm-top5": defineAsyncComponent(
    async () => import("@/components/businessPanel/universal-panel/components/equipment-alarm-top5.vue"),
  ),
  // 报警处理情况
  "alarm-status": defineAsyncComponent(
    async () => import("@/components/businessPanel/universal-panel/components/alarm-processing-status.vue"),
  ),
  // 报警占比
  "alarm-rate": defineAsyncComponent(
    async () => import("@/components/businessPanel/universal-panel/components/alarm-application-rate.vue"),
  ),
  // 设备报警明细
  "equipment-details": defineAsyncComponent(
    async () => import("@/components/businessPanel/universal-panel/components/equipment-alarm-details.vue"),
  ),
  // 设备报警率
  "equipment-rate": defineAsyncComponent(
    async () => import("@/components/businessPanel/universal-panel/components/equipment-alarm-rate.vue"),
  ),
  // 设备实时数据
  "equipment-real-time-data": defineAsyncComponent(
    async () => import("@/components/businessPanel/universal-panel/components/equipment-real-time-data.vue"),
  ),
  // 设备报警趋势
  "equipment-trend": defineAsyncComponent(
    async () => import("@/components/businessPanel/universal-panel/components/equipment-alarm-trend.vue"),
  ),
  // 设备异常统计
  "equipment-statistics": defineAsyncComponent(
    async () => import("@/components/businessPanel/universal-panel/components/equipment-anomaly-statistics.vue"),
  ),
  // 离线设备明细
  "device-offline-details": defineAsyncComponent(
    async () => import("@/components/businessPanel/universal-panel/components/device-offline-details.vue"),
  ),
  // 设备情况总览
  "equipment-overview": defineAsyncComponent(
    async () => import("@/components/businessPanel/universal-panel/components/equipment-overview/equipment-overview.vue"),
  ),
  // 设备离线情况
  "device-offline-situation": defineAsyncComponent(
    async () => import("@/components/businessPanel/universal-panel/components/device-offline-situation.vue"),
  ),
  // 设备统计
  "public-security-device-count": defineAsyncComponent(
    async () => import("@/components/businessPanel/security-overview/cards/public-security-device-count.vue"),
  ),
  // 设备分布统计
  "public-device-distribution": defineAsyncComponent(
    async () => import("@/components/businessPanel/universal-panel/components/public-device-distribution.vue"),
  ),
  // 楼层设备数据
  "floor-device-list": defineAsyncComponent(
    async () => import("@/components/businessPanel/universal-panel/components/floor-device-list.vue"),
  ),
  // 管廊设备数据
  "pipe-device-list": defineAsyncComponent(
    async () => import("@/components/businessPanel/universal-panel/components/pipe-device-list.vue"),
  ),
  // 设备分类统计
  "public-device-classification": defineAsyncComponent(
    async () => import("@/components/businessPanel/universal-panel/components/public-device-classification.vue"),
  ),
  // 设备离线率
  "public-offline-rate-equipment": defineAsyncComponent(
    async () => import("@/components/businessPanel/security-overview/cards/public-offline-rate-equipment.vue"),
  ),
  // 设备处理及趋势分析
  "public-equipment-processing-trends": defineAsyncComponent(
    async () => import("@/components/businessPanel/security-overview/cards/public-equipment-processing-trends.vue"),
  ),
  // 报警处理排名
  "public-alarm-processing-ranking": defineAsyncComponent(
    async () => import("@/components/businessPanel/security-overview/cards/public-alarm-processing-ranking.vue"),
  ),
  /**
   * 能耗通用卡片
   */
  // 碳排量分类占比
  "carbon-emission-ratio": defineAsyncComponent(
    async () => import("@/components/businessPanel/energy-consumption/components/carbon-emission-ratio.vue"),
  ),
  // 区域综合能耗排名Top10
  "carbon-ranking-top10": defineAsyncComponent(
    async () => import("@/components/businessPanel/energy-consumption/components/carbon-ranking-top10.vue"),
  ),
  // 区域综合能耗排名Top5
  "carbon-ranking-top5": defineAsyncComponent(
    async () => import("@/components/businessPanel/energy-consumption/components/carbon-ranking-top5.vue"),
  ),
  // 碳排量趋势图
  "carbon-trends": defineAsyncComponent(async () => import("@/components/businessPanel/energy-consumption/components/carbon-trends.vue")),
  // 综合能耗分类占比
  "energy-consumption-proportion": defineAsyncComponent(
    async () => import("@/components/businessPanel/energy-consumption/components/energy-consumption-proportion.vue"),
  ),
  // 能耗用能趋势图
  "energy-consumption-trend": defineAsyncComponent(
    async () => import("@/components/businessPanel/energy-consumption/components/energy-consumption-trend.vue"),
  ),
  // 全年能耗概览
  "energy-overview": defineAsyncComponent(
    async () => import("@/components/businessPanel/energy-consumption/components/energy-overview.vue"),
  ),
  // 区域用能排名Top10
  "energy-ranking-top10": defineAsyncComponent(
    async () => import("@/components/businessPanel/energy-consumption/components/energy-ranking-top10.vue"),
  ),
  // 区域用能排名Top5
  "energy-ranking-top5": defineAsyncComponent(
    async () => import("@/components/businessPanel/energy-consumption/components/energy-ranking-top5.vue"),
  ),
  // 能耗用能统计
  "energy-statistics": defineAsyncComponent(
    async () => import("@/components/businessPanel/energy-consumption/components/energy-statistics.vue"),
  ),
  // 能耗用能统计
  "energy-analysis": defineAsyncComponent(
    async () => import("@/components/businessPanel/energy-consumption/components/energy-analysis.vue"),
  ),
  // 综合能耗趋势图
  "energy-trend": defineAsyncComponent(async () => import("@/components/businessPanel/energy-consumption/components/energy-trend.vue")),
  // 区域碳排量排名Top10
  "ranking-comprehensive-consumption-top10": defineAsyncComponent(
    async () => import("@/components/businessPanel/energy-consumption/components/ranking-comprehensive-consumption-top10.vue"),
  ),
  // 区域碳排量排名Top5
  "ranking-comprehensive-consumption-top5": defineAsyncComponent(
    async () => import("@/components/businessPanel/energy-consumption/components/ranking-comprehensive-consumption-top5.vue"),
  ),
  // 分项用能占比
  "sub-proportion": defineAsyncComponent(async () => import("@/components/businessPanel/energy-consumption/components/sub-proportion.vue")),
  // 年度用能趋势图
  "annual-energy-consumption-trend": defineAsyncComponent(
    async () => import("@/components/businessPanel/energy-consumption/components/annual-energy-consumption-trend.vue"),
  ),

  /**
   *  报警通用卡片
   */
  // 报警态势
  "public-alarm-situation": defineAsyncComponent(
    async () => import("@/components/businessPanel/energy-consumption/components/annual-energy-consumption-trend.vue"),
  ),
  // 报警统计(饼图)
  "public-alarm-situation-pie": defineAsyncComponent(
    async () => import("@/components/businessPanel/security-overview/cards/public-alarm-situation-pie.vue"),
  ),
  // 报警状态统计 & 报警趋势折线图统计
  "alarm-status-and-trend": defineAsyncComponent(
    async () => import("@/components/businessPanel/security-overview/cards/alarm-status-and-trend.vue"),
  ),
  // 报警状态统计 & 报警列表统计
  "alarm-status-and-list": defineAsyncComponent(
    async () => import("@/components/businessPanel/security-overview/cards/alarm-status-and-list.vue"),
  ),

  /**
   * 电子巡更
   */
  // 今日巡更计划
  patrolStatistics: defineAsyncComponent(async () => import("@/components/businessPanel/electronicPatrol/components/patrolStatistics.vue")),
  // 巡更人员点位排行Top10
  rankingPatrolPersonnel: defineAsyncComponent(
    async () => import("@/components/businessPanel/electronicPatrol/components/rankingPatrolPersonnel.vue"),
  ),
  // 巡更路线
  patrolRoute: defineAsyncComponent(async () => import("@/components/businessPanel/electronicPatrol/components/patrolRoute.vue")),
  // 巡更点异常top5统计
  abnormalPatrolPoint: defineAsyncComponent(
    async () => import("@/components/businessPanel/electronicPatrol/components/abnormalPatrolPoint.vue"),
  ),
  // 巡更点位排行榜Top10
  rankingListPatrolPoints: defineAsyncComponent(
    async () => import("@/components/businessPanel/electronicPatrol/components/rankingListPatrolPoints.vue"),
  ),

  /**
   * 物业管理
   */
  // 物业收支明细
  "property-income-details": defineAsyncComponent(
    async () => import("@/components/businessPanel/estate-management/property-income-details.vue"),
  ),
  // 物业收支对比
  "comparison-property-revenue": defineAsyncComponent(
    async () => import("@/components/businessPanel/estate-management/comparison-property-revenue.vue"),
  ),
  // 物业收入总览
  "overview-property-revenue": defineAsyncComponent(
    async () => import("@/components/businessPanel/estate-management/overview-property-revenue.vue"),
  ),
  // 企业数量统计
  "statistics-number-enterprises": defineAsyncComponent(
    async () => import("@/components/businessPanel/estate-management/statistics-number-enterprises.vue"),
  ),
  // 物业收入汇总
  "summary-property-revenue": defineAsyncComponent(
    async () => import("@/components/businessPanel/estate-management/summary-property-revenue.vue"),
  ),
  // 企业入驻趋势
  "trend-enterprise-settlement": defineAsyncComponent(
    async () => import("@/components/businessPanel/estate-management/trend-enterprise-settlement.vue"),
  ),
  /**
   * 物业管理
   */
  // 消费人数统计
  "consumer-statistics": defineAsyncComponent(async () => import("@/components/businessPanel/restaurant/consumer-statistics.vue")),
  // 消费金额趋势图
  "display-consumption-amount": defineAsyncComponent(
    async () => import("@/components/businessPanel/restaurant/display-consumption-amount.vue"),
  ),
  // 人均消费金额统计
  "per-capita-consumption-amount-statistics": defineAsyncComponent(
    async () => import("@/components/businessPanel/restaurant/per-capita-consumption-amount-statistics.vue"),
  ),
  // 场所消费金额占比
  "proportion-consumption-amount": defineAsyncComponent(
    async () => import("@/components/businessPanel/restaurant/proportion-consumption-amount.vue"),
  ),
  // 账户消费Top10
  "top-count-consumption": defineAsyncComponent(async () => import("@/components/businessPanel/restaurant/top-count-consumption.vue")),
  // 消费金额展示
  "trend-consumption-amount": defineAsyncComponent(
    async () => import("@/components/businessPanel/restaurant/trend-consumption-amount.vue"),
  ),
  /**
   * 厕所管理
   */
  // 蹲位占用情况
  "squatting-occupancy-situation": defineAsyncComponent(
    async () => import("@/components/businessPanel/toilet-management/squatting-occupancy-situation.vue"),
  ),

  /**
   * 人员管理
   */

  // 高风险人员列表
  "list-high-risk-personnel": defineAsyncComponent(
    async () => import("@/components/businessPanel/staff-management/list-high-risk-personnel.vue"),
  ),
  // 在矫对象概况
  "overview-correction-object": defineAsyncComponent(
    async () => import("@/components/businessPanel/staff-management/overview-correction-object.vue"),
  ),
  // 外来人员概况
  "overview-external-personnel": defineAsyncComponent(
    async () => import("@/components/businessPanel/staff-management/overview-external-personnel.vue"),
  ),
  // 师生比例
  "overview-police-force": defineAsyncComponent(
    async () => import("@/components/businessPanel/staff-management/overview-police-force.vue"),
  ),
  // 超时未出人员信息
  "personnel-information-released-timeout": defineAsyncComponent(
    async () => import("@/components/businessPanel/staff-management/personnel-information-released-timeout.vue"),
  ),
  // 在矫对象风险等级占比
  "proportion-risk-level-correction-object": defineAsyncComponent(
    async () => import("@/components/businessPanel/staff-management/proportion-risk-level-correction-object.vue"),
  ),
  // 学生点名记录
  "statistics-correction-object": defineAsyncComponent(
    async () => import("@/components/businessPanel/staff-management/statistics-correction-objects.vue"),
  ),
  // 老师进出记录
  "police-statistics": defineAsyncComponent(async () => import("@/components/businessPanel/staff-management/police-statistics.vue")),
  // 外来人员统计
  "statistics-external-personnel": defineAsyncComponent(
    async () => import("@/components/businessPanel/staff-management/statistics-external-personnel.vue"),
  ),
  // 今日宿舍点名情况
  "today-dormitory-roll-call-situation": defineAsyncComponent(
    async () => import("@/components/businessPanel/staff-management/today-dormitory-roll-call-situation.vue"),
  ),

  /**
   * 小散工程
   */
  // 小散工程统计
  "small-statistics": defineAsyncComponent(async () => import("@/components/businessPanel/small-engineering/small-statistics.vue")),
  // 工程整改统计
  "engineering-rectification-statistics": defineAsyncComponent(
    async () => import("@/components/businessPanel/small-engineering/engineering-rectification-statistics.vue"),
  ),
  // 工程巡查统计
  "engineering-inspection-statistics": defineAsyncComponent(
    async () => import("@/components/businessPanel/small-engineering/engineering-inspection-statistics.vue"),
  ),
  // 工程巡查异常统计
  "abnormal-statistics-engineering-inspection": defineAsyncComponent(
    async () => import("@/components/businessPanel/small-engineering/abnormal-statistics-engineering-inspection.vue"),
  ),

  /**
   * 电瓶车
   */
  // 电瓶车建档统计
  "electric-vehicle-registration-statistics": defineAsyncComponent(
    async () => import("@/components/businessPanel/electricVehicle/electric-vehicle-registration-statistics.vue"),
  ),
  // 电瓶车违规入电梯统计
  "electric-vehicles-illegally-entering-elevators": defineAsyncComponent(
    async () => import("@/components/businessPanel/electricVehicle/electric-vehicles-illegally-entering-elevators.vue"),
  ),
  // 电动车违规充电统计
  "statistics-illegal-charging-electric-vehicles": defineAsyncComponent(
    async () => import("@/components/businessPanel/electricVehicle/statistics-illegal-charging-electric-vehicles.vue"),
  ),
  // 电动车违规停放统计
  "statistics-illegal-parking-electric-vehicles": defineAsyncComponent(
    async () => import("@/components/businessPanel/electricVehicle/statistics-illegal-parking-electric-vehicles.vue"),
  ),
  // 电瓶车违规占比
  "violation-statistics-electric-vehicles": defineAsyncComponent(
    async () => import("@/components/businessPanel/electricVehicle/violation-statistics-electric-vehicles.vue"),
  ),
  // 电梯运行分析
  "elevator-analysis-panel": defineAsyncComponent(
    async () => import("@/components/businessPanel/security-situationNew/components/elevator-analysis-panel.vue"),
  ),
  /**
   * 医护对讲
   */
  // 呼叫统计
  "call-statistics-panel": defineAsyncComponent(
    async () => import("@/components/businessPanel/medical-intercom/overview-medical-intercom/components/call-statistics-panel.vue"),
  ),
  // 呼叫趋势
  "call-trends": defineAsyncComponent(
    async () => import("@/components/businessPanel/medical-intercom/overview-medical-intercom/components/call-trends.vue"),
  ),
  // 呼叫时段分布
  "distribution-call-time-periods": defineAsyncComponent(
    async () =>
      import("@/components/businessPanel/medical-intercom/overview-medical-intercom/components/distribution-call-time-periods.vue"),
  ),
  /**
   * 分诊排号
   */
  // 看诊数据
  "visiting-data-panel": defineAsyncComponent(
    async () => import("@/components/businessPanel/triage-queue/components/visiting-data-panel.vue"),
  ),
  // 接诊趋势
  "reception-trends-panel": defineAsyncComponent(
    async () => import("@/components/businessPanel/triage-queue/components/reception-trends-panel.vue"),
  ),
  // 候诊情况
  "waiting-situation-panel": defineAsyncComponent(
    async () => import("@/components/businessPanel/triage-queue/components/waiting-situation-panel.vue"),
  ),
  // 预约就诊分布
  "appointment-visit-distribution-panel": defineAsyncComponent(
    async () => import("@/components/businessPanel/triage-queue/components/appointment-visit-distribution-panel.vue"),
  ),
  // 院区介绍
  "introduction-of-hospital": defineAsyncComponent(
    async () => import("@/components/businessPanel/triage-queue/components/introduction-of-hospital.vue"),
  ),
  // 今日气体使用概览
  "today-gas-usage": defineAsyncComponent(async () => import("@/components/businessPanel/medical-gas-new/cards/today-gas-usage.vue")),
  // 气体用量情况
  "gas-usage-situation": defineAsyncComponent(
    async () => import("@/components/businessPanel/medical-gas-new/cards/gas-usage-situation.vue"),
  ),
  // 气体使用趋势
  "gas-usage-trend": defineAsyncComponent(async () => import("@/components/businessPanel/medical-gas-new/cards/gas-usage-trend.vue")),
  // 报警态势
  "hospital-alarm-situation": defineAsyncComponent(
    async () => import("@/components/businessPanel/children-hospital/cards/alarm-stats.vue"),
  ),
  // 报警趋势
  "hospital-alarm-trend": defineAsyncComponent(async () => import("@/components/businessPanel/children-hospital/cards/alarm-trend.vue")),
  // 示教情况总览
  "teaching-overview": defineAsyncComponent(
    async () => import("@/components/businessPanel/surgical-demonstration-new/cards/teaching-overview.vue"),
  ),
  // 示教直播场次
  "teaching-live-sessions": defineAsyncComponent(
    async () => import("@/components/businessPanel/surgical-demonstration-new/cards/teaching-live-sessions.vue"),
  ),
  // 最受欢迎视频Top10
  "popular-videos": defineAsyncComponent(
    async () => import("@/components/businessPanel/surgical-demonstration-new/cards/popular-videos.vue"),
  ),
  /**
   * 门禁管理
   */
  //  车流驶出趋势
  "trend-vehicle-flow-driving-out": defineAsyncComponent(
    async () => import("@/components/businessPanel/stop-manage/stop-general-manage-right/trend-vehicle-flow-driving-out.vue"),
  ),
  //  实时出入记录
  "real-time-access-records": defineAsyncComponent(
    async () => import("@/components/businessPanel/stop-manage/stop-general-manage-right/real-time-access-records.vue"),
  ),
  //  出入统计
  "entry-and-exit-records": defineAsyncComponent(
    async () => import("@/components/businessPanel/stop-manage/stop-general-manage-right/entry-and-exit-records.vue"),
  ),
  // 设备实时状态
  "device-realtime-status": defineAsyncComponent(
    async () => import("@/components/businessPanel/access-control/cards/device-realtime-status.vue"),
  ),
  // 异常事件top5
  "abnormal-event-top5": defineAsyncComponent(
    async () => import("@/components/businessPanel/access-control/cards/abnormal-event-top5.vue"),
  ),
  // 异常通行趋势
  "abnormal-traffic-trend-new": defineAsyncComponent(
    async () => import("@/components/businessPanel/access-control/cards/abnormal-traffic-trend.vue"),
  ),
  // 人流通行趋势
  "personnel-traffic-trend": defineAsyncComponent(
    async () => import("@/components/businessPanel/access-control/cards/personnel-traffic-trend.vue"),
  ),
  // 通行分析
  "passage-analysis": defineAsyncComponent(async () => import("@/components/businessPanel/access-control/cards/passage-analysis.vue")),
  // 实时通行数据
  "real-time-passage-data": defineAsyncComponent(
    async () => import("@/components/businessPanel/access-control/cards/real-time-passage-data.vue"),
  ),

  /** 商户管理 */
  // 商户/档位统计
  "merchant-gear-stats": defineAsyncComponent(
    async () => import("@/components/businessPanel/merchant-manage/cards/merchant-gear-stats.vue"),
  ),
  // 商户清单
  "merchant-list-card": defineAsyncComponent(async () => import("@/components/businessPanel/merchant-manage/cards/merchant-list-card.vue")),
  // 区域档位数
  "area-gear-count": defineAsyncComponent(async () => import("@/components/businessPanel/merchant-manage/cards/area-gear-count.vue")),
  // 问卷调查统计
  "questionnaire-stats": defineAsyncComponent(
    async () => import("@/components/businessPanel/merchant-manage/cards/questionnaire-stats.vue"),
  ),
  // 诚信经营占比
  "honesty-proportion": defineAsyncComponent(async () => import("@/components/businessPanel/merchant-manage/cards/honesty-proportion.vue")),
  // 诚信经营值统计
  "honesty-stats": defineAsyncComponent(async () => import("@/components/businessPanel/merchant-manage/cards/honesty-stats.vue")),
  // 商户合同统计
  "contract-stats": defineAsyncComponent(async () => import("@/components/businessPanel/merchant-manage/cards/contract-stats.vue")),

  /** 广播系统 */
  // 广播记录排名
  "broadcast-record-ranking": defineAsyncComponent(async () => import("@/components/businessPanel/broadcast/cards/record-ranking.vue")),
  // 广播记录趋势
  "broadcast-record-trend": defineAsyncComponent(async () => import("@/components/businessPanel/broadcast/cards/record-trend.vue")),
  // 最新记录明细
  "broadcast-latest-records": defineAsyncComponent(async () => import("@/components/businessPanel/broadcast/cards/latest-records.vue")),

  /** 锅炉系统 */
  // 数据概览
  "boiler-data-overview": defineAsyncComponent(async () => import("@/components/businessPanel/boiler/cards/data-overview.vue")),
  // 实时温度趋势
  "boiler-temperature-trend": defineAsyncComponent(async () => import("@/components/businessPanel/boiler/cards/temperature-trend.vue")),
  // 用水趋势
  "boiler-water-trend": defineAsyncComponent(async () => import("@/components/businessPanel/boiler/cards/water-trend.vue")),
  // 用电趋势
  "boiler-energy-trend": defineAsyncComponent(async () => import("@/components/businessPanel/boiler/cards/energy-trend.vue")),
  // 设备统计
  "boiler-device-stats": defineAsyncComponent(async () => import("@/components/businessPanel/boiler/cards/device-stats.vue")),
  // 超温统计
  "boiler-over-temperature-stats": defineAsyncComponent(
    async () => import("@/components/businessPanel/boiler/cards/over-temperature-stats.vue"),
  ),
  // 设备报警
  "boiler-device-alarm": defineAsyncComponent(async () => import("@/components/businessPanel/boiler/cards/device-alarm.vue")),
  // 水处理实时数据
  "water-treatment-realtime": defineAsyncComponent(
    async () => import("@/components/businessPanel/sewage-disposal/cards/water-treatment-realtime.vue"),
  ),

  /** 电梯管理 */
  // 电梯统计
  "lift-stats": defineAsyncComponent(async () => import("@/components/businessPanel/lift-manage/cards/lift-stats.vue")),
  // 运行分析
  "lift-operation-analysis": defineAsyncComponent(
    async () => import("@/components/businessPanel/lift-manage/cards/lift-operation-analysis.vue"),
  ),
  // 电梯状态监测
  "lift-status-monitor": defineAsyncComponent(async () => import("@/components/businessPanel/lift-manage/cards/lift-status-monitor.vue")),
  // 电梯报警等级统计
  "lift-alarm-level-stats": defineAsyncComponent(
    async () => import("@/components/businessPanel/lift-manage/cards/lift-alarm-level-stats.vue"),
  ),
  // 电梯设备报警趋势
  "lift-device-alarm-trend": defineAsyncComponent(
    async () => import("@/components/businessPanel/lift-manage/cards/lift-device-alarm-trend.vue"),
  ),
  // 最新五方通话
  "latest-five-way-call": defineAsyncComponent(async () => import("@/components/businessPanel/lift-manage/cards/latest-five-way-call.vue")),

  /** 净水系统 */
  // 净水用量情况
  "water-usage-situation": defineAsyncComponent(
    async () => import("@/components/businessPanel/water-purification/cards/water-usage-situation.vue"),
  ),
  // 净水使用趋势
  "water-usage-trend": defineAsyncComponent(
    async () => import("@/components/businessPanel/water-purification/cards/water-usage-trend.vue"),
  ),
  // 区域使用量概况
  "area-usage-overview": defineAsyncComponent(
    async () => import("@/components/businessPanel/water-purification/cards/area-usage-overview.vue"),
  ),

  /** 物流系统 */
  // 物流系统设备状态分布
  "logistics-device-status-distribution": defineAsyncComponent(
    async () => import("@/components/businessPanel/logistics/cards/logistics-device-status-distribution.vue"),
  ),
  // 设备在线情况
  "logistics-device-online-status": defineAsyncComponent(
    async () => import("@/components/businessPanel/logistics/cards/logistics-device-online-status.vue"),
  ),

  /** 客流分析 */
  // 客流总览
  "passenger-flow-overview": defineAsyncComponent(
    async () => import("@/components/businessPanel/passenger-flow/cards/passenger-flow-overview.vue"),
  ),
  // 各区域客流量排名
  "passenger-flow-ranking": defineAsyncComponent(
    async () => import("@/components/businessPanel/passenger-flow/cards/passenger-flow-ranking.vue"),
  ),
  // 客流分析图
  "passenger-flow-analysis": defineAsyncComponent(
    async () => import("@/components/businessPanel/passenger-flow/cards/passenger-flow-analysis.vue"),
  ),
  // 各个区域客流量
  "passenger-flow-regional": defineAsyncComponent(
    async () => import("@/components/businessPanel/passenger-flow/cards/passenger-flow-regional.vue"),
  ),

  /** 园林系统 */
  // 设备在线情况
  "garden-device-online-status": defineAsyncComponent(
    async () => import("@/components/businessPanel/gardens/cards/garden-device-online-status.vue"),
  ),

  /** 园区管理 */
  // 空间利用率
  "park-space-utilization": defineAsyncComponent(
    async () => import("@/components/businessPanel/park-management/cards/park-space-utilization.vue"),
  ),
  // 楼栋空间利用率
  "park-building-space-utilization": defineAsyncComponent(
    async () => import("@/components/businessPanel/park-management/cards/park-building-space-utilization.vue"),
  ),
  // 租赁企业行业情况统计
  "park-enterprise-industry-stats": defineAsyncComponent(
    async () => import("@/components/businessPanel/park-management/cards/park-enterprise-industry-stats.vue"),
  ),
  // 园区租赁总情况
  "park-leasing-overview": defineAsyncComponent(
    async () => import("@/components/businessPanel/park-management/cards/park-leasing-overview.vue"),
  ),
  // 园区租赁趋势
  "park-leasing-trends": defineAsyncComponent(
    async () => import("@/components/businessPanel/park-management/cards/park-leasing-trends.vue"),
  ),
  // 园区楼层租赁比情况
  "park-floor-leasing-ratio": defineAsyncComponent(
    async () => import("@/components/businessPanel/park-management/cards/park-floor-leasing-ratio.vue"),
  ),

  /** 会议管理 */
  // 会议空闲情况
  "meeting-availability": defineAsyncComponent(
    async () => import("@/components/businessPanel/management-meetings/cards/meeting-availability.vue"),
  ),
  // 预定时段分析
  "booking-period-analysis": defineAsyncComponent(
    async () => import("@/components/businessPanel/management-meetings/cards/booking-period-analysis.vue"),
  ),
  // 会议室利用率分析
  "meeting-room-utilization": defineAsyncComponent(
    async () => import("@/components/businessPanel/management-meetings/cards/meeting-room-utilization.vue"),
  ),

  /** 紧急电话 */
  // 最新紧急电话
  "latest-emergency-calls": defineAsyncComponent(
    async () => import("@/components/businessPanel/emergency-phone/cards/latest-emergency-calls.vue"),
  ),
  // 电话使用趋势
  "call-usage-trends": defineAsyncComponent(async () => import("@/components/businessPanel/emergency-phone/cards/call-usage-trends.vue")),
  // 设备在线情况
  "call-device-online-status": defineAsyncComponent(
    async () => import("@/components/businessPanel/emergency-phone/cards/device-online-status.vue"),
  ),

  /** 交通灯 */
  // 设备在线情况
  "traffic-light-device-online-status": defineAsyncComponent(
    async () => import("@/components/businessPanel/traffic-light/cards/traffic-light-device-online-status.vue"),
  ),

  /** 交通控制 */
  // 设备在线情况
  "traffic-control-device-online-status": defineAsyncComponent(
    async () => import("@/components/businessPanel/traffic-light/cards/traffic-light-device-online-status.vue"),
  ),

  /** 车流量监测 */
  // 隧道今日车流量分析
  "tunnel-today-traffic-flow": defineAsyncComponent(
    async () => import("@/components/businessPanel/traffic-volume/cards/tunnel-today-traffic-flow.vue"),
  ),
  // 隧道不同车道车流量分析
  "tunnel-lane-traffic-flow": defineAsyncComponent(
    async () => import("@/components/businessPanel/traffic-volume/cards/tunnel-lane-traffic-flow.vue"),
  ),
  // 断面实时平均车速分析
  "section-realtime-speed": defineAsyncComponent(
    async () => import("@/components/businessPanel/traffic-volume/cards/section-realtime-speed.vue"),
  ),

  /** 应急资源 */
  // 当前应急物资情况统计
  "emergency-supplies-status": defineAsyncComponent(
    async () => import("@/components/businessPanel/emergency-resources/cards/emergency-supplies-status.vue"),
  ),
  // 应急物资在库统计
  "emergency-supplies-stock": defineAsyncComponent(
    async () => import("@/components/businessPanel/emergency-resources/cards/emergency-supplies-stock.vue"),
  ),
  // 应急资金趋势统计
  "emergency-funds-trend": defineAsyncComponent(
    async () => import("@/components/businessPanel/emergency-resources/cards/emergency-funds-trend.vue"),
  ),
  // 应急人员统计
  "emergency-personnel-stats": defineAsyncComponent(
    async () => import("@/components/businessPanel/emergency-resources/cards/emergency-personnel-stats.vue"),
  ),
  // 应急设备统计
  "emergency-equipment-stats": defineAsyncComponent(
    async () => import("@/components/businessPanel/emergency-resources/cards/emergency-equipment-stats.vue"),
  ),
  // 应急设施使用率
  "emergency-facility-usage": defineAsyncComponent(
    async () => import("@/components/businessPanel/emergency-resources/cards/emergency-facility-usage.vue"),
  ),

  /** 智能卡 */
  // 智能卡状态统计
  "smart-card-status-stats": defineAsyncComponent(
    async () => import("@/components/businessPanel/smart-card/cards/smart-card-status-stats.vue"),
  ),
  // 来访人员趋势图
  "smart-visitor-trends": defineAsyncComponent(async () => import("@/components/businessPanel/smart-card/cards/smart-visitor-trends.vue")),
  // 门禁事件Top10
  "smart-access-events-top10": defineAsyncComponent(
    async () => import("@/components/businessPanel/smart-card/cards/smart-access-events-top10.vue"),
  ),
  // 梯控事件Top10
  "smart-elevator-events-top10": defineAsyncComponent(
    async () => import("@/components/businessPanel/smart-card/cards/smart-elevator-events-top10.vue"),
  ),
  // 可视对讲事件Top10
  "smart-intercom-events-top10": defineAsyncComponent(
    async () => import("@/components/businessPanel/smart-card/cards/smart-intercom-events-top10.vue"),
  ),

  /** 环境监测 */
  // 隧道环境指标实时监测
  "tunnel-environment-realtime": defineAsyncComponent(
    async () => import("@/components/businessPanel/environmental-monitoring/cards/tunnel-environment-realtime.vue"),
  ),
  // 隧道CO浓度趋势分析
  "tunnel-co-trend-analysis": defineAsyncComponent(
    async () => import("@/components/businessPanel/environmental-monitoring/cards/tunnel-co-trend-analysis.vue"),
  ),
  // 实时隧道环境指标趋势分析
  "realtime-environment-trend-analysis": defineAsyncComponent(
    async () => import("@/components/businessPanel/environmental-monitoring/cards/realtime-environment-trend-analysis.vue"),
  ),

  /** 消费管理 */
  // 金额交易情况概览
  "transaction-overview": defineAsyncComponent(async () => import("@/components/businessPanel/consumption/cards/transaction-overview.vue")),
  // 金额交易趋势图
  "transaction-trend": defineAsyncComponent(async () => import("@/components/businessPanel/consumption/cards/transaction-trend.vue")),
  // 账户消费Top10
  "account-consumption-top10": defineAsyncComponent(
    async () => import("@/components/businessPanel/consumption/cards/account-consumption-top10.vue"),
  ),
  // 份额交易概览
  "share-transaction-overview": defineAsyncComponent(
    async () => import("@/components/businessPanel/consumption/cards/share-transaction-overview.vue"),
  ),
  // 份额交易趋势图
  "share-transaction-trend": defineAsyncComponent(
    async () => import("@/components/businessPanel/consumption/cards/share-transaction-trend.vue"),
  ),
  // 账户实时状态统计
  "account-status-stats": defineAsyncComponent(async () => import("@/components/businessPanel/consumption/cards/account-status-stats.vue")),

  /** 消费管理 */
  // 电表日用能趋势图
  "electricity-usage-trend": defineAsyncComponent(
    async () => import("@/components/businessPanel/Prepaid/cards/electricity-usage-trend.vue"),
  ),
  // 失联电表实时统计
  "lost-electricity-meter-stats": defineAsyncComponent(
    async () => import("@/components/businessPanel/Prepaid/cards/lost-electricity-meter-stats.vue"),
  ),
  // 欠费电表占比
  "arrears-electricity-meter-stats": defineAsyncComponent(
    async () => import("@/components/businessPanel/Prepaid/cards/arrears-electricity-meter-stats.vue"),
  ),
  // 水表日用能趋势图
  "prepaid-water-usage-trend": defineAsyncComponent(async () => import("@/components/businessPanel/Prepaid/cards/water-usage-trend.vue")),
  // 失联水表实时统计
  "lost-water-meter-stats": defineAsyncComponent(async () => import("@/components/businessPanel/Prepaid/cards/lost-water-meter-stats.vue")),
  // 欠费水表占比
  "arrears-water-meter-stats": defineAsyncComponent(
    async () => import("@/components/businessPanel/Prepaid/cards/arrears-water-meter-stats.vue"),
  ),

  /** 星配送 */
  // 订单分布统计
  "star-order-distribution": defineAsyncComponent(
    async () => import("@/components/businessPanel/delivery/cards/star-order-distribution.vue"),
  ),
  // 订单趋势统计
  "star-order-trend": defineAsyncComponent(async () => import("@/components/businessPanel/delivery/cards/star-order-trend.vue")),
  // 用户分布统计
  "star-user-distribution": defineAsyncComponent(
    async () => import("@/components/businessPanel/delivery/cards/star-user-distribution.vue"),
  ),
  // 用户趋势统计
  "star-user-trend": defineAsyncComponent(async () => import("@/components/businessPanel/delivery/cards/star-user-trend.vue")),
  // 营收分布统计
  "star-revenue-distribution": defineAsyncComponent(
    async () => import("@/components/businessPanel/delivery/cards/star-revenue-distribution.vue"),
  ),
  // 营收趋势统计
  "star-revenue-trend": defineAsyncComponent(async () => import("@/components/businessPanel/delivery/cards/star-revenue-trend.vue")),
  // 实时评价
  "star-realtime-evaluation": defineAsyncComponent(
    async () => import("@/components/businessPanel/delivery/cards/star-realtime-evaluation.vue"),
  ),

  /** 猪肉滑轨 */
  // 白条交易大户Top5
  "meat-transaction-top5": defineAsyncComponent(
    async () => import("@/components/businessPanel/meat-trading/cards/meat-transaction-top5.vue"),
  ),
  // 屠宰场供货TOP
  "meat-slaughterhouse-supply-top": defineAsyncComponent(
    async () => import("@/components/businessPanel/meat-trading/cards/meat-slaughterhouse-supply-top.vue"),
  ),
  // 交易信息
  "meat-transaction-info": defineAsyncComponent(
    async () => import("@/components/businessPanel/meat-trading/cards/meat-transaction-info.vue"),
  ),
  // 供货信息
  "meat-supply-info": defineAsyncComponent(async () => import("@/components/businessPanel/meat-trading/cards/meat-supply-info.vue")),
  // 食安信息
  "meat-food-safety-info": defineAsyncComponent(
    async () => import("@/components/businessPanel/meat-trading/cards/meat-food-safety-info.vue"),
  ),
  // 来货报备
  "meat-food-safety-floor": defineAsyncComponent(
    async () => import("@/components/businessPanel/meat-trading/cards/meat-food-safety-floor.vue"),
  ),
  // 批次作弊嫌疑率
  "meat-batch-suspicion-rate": defineAsyncComponent(
    async () => import("@/components/businessPanel/meat-trading/cards/meat-batch-suspicion-rate.vue"),
  ),
  // 设备数据
  "meat-device-data": defineAsyncComponent(async () => import("@/components/businessPanel/meat-trading/cards/meat-device-data.vue")),
  // 白条交易数据
  "meat-white-stripe-transaction-data": defineAsyncComponent(
    async () => import("@/components/businessPanel/meat-trading/cards/meat-white-stripe-transaction-data.vue"),
  ),
  // 理货审核率
  "meat-tally-audit-rate": defineAsyncComponent(
    async () => import("@/components/businessPanel/meat-trading/cards/meat-tally-audit-rate.vue"),
  ),
  // 天津
  // 白条交易大户Top5
  "tianjin-transaction-top5": defineAsyncComponent(
    async () => import("@/components/businessPanel/meat-trading/cards/meat-transaction-top5.vue"),
  ),
  // 屠宰场供货TOP
  "tianjin-slaughterhouse-supply-top": defineAsyncComponent(
    async () => import("@/components/businessPanel/meat-trading/cards/meat-slaughterhouse-supply-top.vue"),
  ),
  // 交易信息
  "tianjin-transaction-info": defineAsyncComponent(
    async () => import("@/components/businessPanel/meat-trading/cards/meat-transaction-info.vue"),
  ),
  // 供货信息
  "tianjin-supply-info": defineAsyncComponent(async () => import("@/components/businessPanel/meat-trading/cards/meat-supply-info.vue")),
  // 食安信息
  "tianjin-food-safety-info": defineAsyncComponent(
    async () => import("@/components/businessPanel/meat-trading/cards/meat-food-safety-info.vue"),
  ),
  // 来货报备
  "tianjin-food-safety-floor": defineAsyncComponent(
    async () => import("@/components/businessPanel/meat-trading/cards/meat-food-safety-floor.vue"),
  ),
  // 批次作弊嫌疑率
  "tianjin-batch-suspicion-rate": defineAsyncComponent(
    async () => import("@/components/businessPanel/meat-trading/cards/meat-batch-suspicion-rate.vue"),
  ),
  // 设备数据
  "tianjin-device-data": defineAsyncComponent(async () => import("@/components/businessPanel/meat-trading/cards/meat-device-data.vue")),
  // 白条交易数据
  "tianjin-white-stripe-transaction-data": defineAsyncComponent(
    async () => import("@/components/businessPanel/meat-trading/cards/meat-white-stripe-transaction-data.vue"),
  ),
  // 理货审核率
  "tianjin-tally-audit-rate": defineAsyncComponent(
    async () => import("@/components/businessPanel/meat-trading/cards/meat-tally-audit-rate.vue"),
  ),

  /** 照明管理 */
  // 照明回路实况
  "lighting-circuit-status": defineAsyncComponent(
    async () => import("@/components/businessPanel/lighting/cards/lighting-circuit-status.vue"),
  ),
  // 群控组实时数据
  "group-control-realtime-data": defineAsyncComponent(
    async () => import("@/components/businessPanel/lighting/cards/group-control-realtime-data.vue"),
  ),
  // 时控实时数据
  "time-control-realtime-data": defineAsyncComponent(
    async () => import("@/components/businessPanel/lighting/cards/time-control-realtime-data.vue"),
  ),
  // 信息发布
  "information-publish": defineAsyncComponent(async () => import("@/components/businessPanel/operation/cards/information-publish.vue")),

  // 教务态势
  ...educational_situation_cards,
  // 安全管理
  ...safety_manage_cards,

  // 预案演练
  "emergency-drill": defineAsyncComponent(
    async () => (await import("@/pages/widget/business-cards/emergency-drill/emergency-drill")).EmergencyDrill,
  ),

  ...command_dispatch_cards,
  ...parking_car_cards,
  ...people_flow_cards,
  ...pz_demo_cards,
  ...shandong_cards,
  ...zhongda_heshun_cards,
};
