/**
 * 卡片注册入口 — 聚合各域 register 模块
 * 卡片的 key 需要和 cardDefinition 中的 code 保持一致
 */

import { Component, defineAsyncComponent } from "vue";

import { command_dispatch_cards } from "../command-dispatch-v2/cards";
import { educational_situation_cards } from "../educational-situation/cards";
import { parking_car_cards } from "../parking-car/cards";
import { people_flow_cards } from "../people-flow/cards";
import { safety_manage_cards } from "../safety-manage-cards/cards";
import { shandong_cards } from "../shandong-cards/cards";
import { visor_panel_cards } from "../visor-panel/cards";
import { water_purification_cards } from "../water-purification/cards";
import { zhongda_heshun_cards } from "../zhongda-heshun/cards";
import { overviewCards } from "./overview";
import { securityOverviewCards } from "./security-overview";
import { universalPanelCards } from "./universal-panel";

/** 卡片集合 */
export const CardCollective: Record<string, Component> = {
  ...overviewCards,
  ...securityOverviewCards,
  ...universalPanelCards,

  /** 安全2.0 安防监控 */
  "security-alarm-count": defineAsyncComponent(async () => import("@/features/cards/security-monitoring-safty/cards/security-alarm-count")),
  "security-alarm-trend": defineAsyncComponent(async () => import("@/features/cards/security-monitoring-safty/cards/security-alarm-trend")),
  "security-alarm-event-count": defineAsyncComponent(
    async () => import("@/features/cards/security-monitoring-safty/cards/security-alarm-event-count"),
  ),
  "security-alarm-event-ratio": defineAsyncComponent(
    async () => import("@/features/cards/security-monitoring-safty/cards/security-alarm-event-ratio"),
  ),
  "security-alarm-record": defineAsyncComponent(
    async () => import("@/features/cards/security-monitoring-safty/cards/security-alarm-record"),
  ),
  "security-monitor": defineAsyncComponent(async () => import("@/features/cards/security-monitoring-safty/cards/security-monitor")),
  "security-monitor-device-count": defineAsyncComponent(
    async () => import("@/features/cards/security-monitoring-safty/cards/security-monitor-device-count"),
  ),
  /** 安防监控2.0 园区 */
  "alarm-statistics": defineAsyncComponent(async () => import("@/features/cards/security/cards/alarm-statistics/alarm-statistics")),
  "alarm-level-statistics": defineAsyncComponent(
    async () => import("@/features/cards/security/cards/alarm-level-statistics/alarm-level-statistics"),
  ),
  "patrol-abnormal-stats": defineAsyncComponent(
    async () => import("@/features/cards/security/cards/patrol-abnormal-stats/patrol-abnormal-stats"),
  ),
  /** 电气安全 */
  "electrical-device": defineAsyncComponent(async () => import("@/features/cards/electrical/cards/electrical-device")),
  /** 消防管理 */
  "fire-device-stats": defineAsyncComponent(async () => import("@/features/cards/fire-control/cards/fire-device-stats")),
  "fire-expired-device-stats": defineAsyncComponent(async () => import("@/features/cards/fire-control/cards/fire-expired-device-stats")),
  "fire-pipe-network": defineAsyncComponent(async () => import("@/features/cards/fire-controlNew/cards/fire-pipe-network")),
  "fire-device-distribution": defineAsyncComponent(async () => import("@/features/cards/fire-controlNew/cards/fire-device-distribution")),
  /** 动环监控 */
  "ups-work-situation": defineAsyncComponent(async () => import("@/features/cards/environmental-new-monitor/cards/ups-work-situation")),
  "environmental-device": defineAsyncComponent(async () => import("@/features/cards/environmental-new-monitor/cards/environmental-device")),
  /** 安全管理2.0  */
  "hidden-danger-statistics": defineAsyncComponent(async () => import("@/features/cards/safety-management/cards/hidden-danger-statistics")),
  "small-project-records": defineAsyncComponent(async () => import("@/features/cards/safety-management/cards/small-project-records")),
  "safety-inspection-statistics": defineAsyncComponent(
    async () => import("@/features/cards/safety-management/cards/safety-inspection-statistics"),
  ),
  "safety-education-statistics": defineAsyncComponent(
    async () => import("@/features/cards/safety-management/cards/safety-education-statistics"),
  ),
  "fire-equipment-statistics": defineAsyncComponent(
    async () => import("@/features/cards/safety-management/cards/fire-equipment-statistics"),
  ),
  /** 电子巡更 */
  "patrol-route": defineAsyncComponent(async () => import("@/features/cards/electronicPatrol/cards/patrol-route")),
  "patrol-plan": defineAsyncComponent(async () => import("@/features/cards/electronicPatrol/cards/patrol-plan")),
  "patrol-point-abnormal-top5": defineAsyncComponent(
    async () => import("@/features/cards/electronicPatrol/cards/patrol-point-abnormal-top5"),
  ),
  "patrol-point-missed-statistics": defineAsyncComponent(
    async () => import("@/features/cards/electronicPatrol/cards/patrol-point-missed-statistics"),
  ),
  "patrol-abnormal-event-statistics": defineAsyncComponent(
    async () => import("@/features/cards/electronicPatrol/cards/patrol-abnormal-event-statistics"),
  ),
  "today-patrol-statistics": defineAsyncComponent(async () => import("@/features/cards/electronicPatrol/cards/today-patrol-statistics")),
  "today-patrol-time-distribution": defineAsyncComponent(
    async () => import("@/features/cards/electronicPatrol/cards/today-patrol-time-distribution"),
  ),
  "patrol-point-ranking-top10": defineAsyncComponent(
    async () => import("@/features/cards/electronicPatrol/cards/patrol-point-ranking-top10"),
  ),
  "today-patrol-personnel-latest-position": defineAsyncComponent(
    async () => import("@/features/cards/electronicPatrol/cards/today-patrol-personnel-latest-position"),
  ),
  "patrol-point-ranking-top10-hk": defineAsyncComponent(
    async () => import("@/features/cards/electronicPatrol/cards/patrol-point-ranking-top10-hk"),
  ),
  "patrol-point-trend": defineAsyncComponent(async () => import("@/features/cards/electronicPatrol/cards/patrol-point-trend")),
  "monitoring-equipment-statistics": defineAsyncComponent(
    async () => import("@/features/cards/electronicPatrol-new/cards/monitoring-equipment-statistics"),
  ),
  "task-execution-status": defineAsyncComponent(async () => import("@/features/cards/electronicPatrol-new/cards/task-execution-status")),
  "patrol-route-new": defineAsyncComponent(async () => import("@/features/cards/electronicPatrol-new/cards/patrol-route-new")),
  "patrol-point-distribution": defineAsyncComponent(
    async () => import("@/features/cards/electronicPatrol-new/cards/patrol-point-distribution"),
  ),
  "patrol-point-abnormal-top5-new": defineAsyncComponent(
    async () => import("@/features/cards/electronicPatrol-new/cards/patrol-point-abnormal-top5-new"),
  ),
  "task-abnormal-record": defineAsyncComponent(async () => import("@/features/cards/electronicPatrol-new/cards/task-abnormal-record")),
  /** 楼栋详情面板 */
  "building-introduction": defineAsyncComponent(async () => import("@/features/cards/building-details/building-introduction")),
  /** 设备信息面板（设备列表「定位」/ 模型点击设备） */
  deviceDetailsPanel: defineAsyncComponent(async () => import("@/features/cards/floorEquipment/device-details-panel")),
  /** 图书馆管理 */
  "month-statistics": defineAsyncComponent(async () => import("@/features/cards/library-management/cards/month-statistics")),
  "comprehensive-statistics": defineAsyncComponent(
    async () => import("@/features/cards/library-management/cards/comprehensive-statistics"),
  ),
  "device-status-distribution": defineAsyncComponent(
    async () => import("@/features/cards/library-management/cards/device-status-distribution"),
  ),
  "borrowing-records": defineAsyncComponent(async () => import("@/features/cards/library-management/cards/borrowing-records")),
  "author-rank": defineAsyncComponent(async () => import("@/features/cards/library-management/cards/author-rank")),
  "book-rank": defineAsyncComponent(async () => import("@/features/cards/library-management/cards/book-rank")),
  "overview-pm-monitoring": defineAsyncComponent(
    async () => import("@/features/cards/environmental-monitoring/components/overviewPMMonitoring"),
  ),
  "top-real-rankings": defineAsyncComponent(async () => import("@/features/cards/environmental-monitoring/components/top-real-rankings")),
  "air-quality-statistics": defineAsyncComponent(
    async () => import("@/features/cards/environmental-monitoring/components/air-quality-statistics"),
  ),
  "environmental-trend-analysis": defineAsyncComponent(
    async () => import("@/features/cards/environmental-monitoring/components/environmental-trend-analysis"),
  ),
  //园区管理
  "completion-status-investment-targets": defineAsyncComponent(
    async () => import("@/features/cards/park-management/components/completion-status-investment-targets"),
  ),
  "enterprise-complaint-statistics": defineAsyncComponent(
    async () => import("@/features/cards/park-management/components/enterprise-complaint-statistics"),
  ),
  "project-initiation-statistics": defineAsyncComponent(
    async () => import("@/features/cards/park-management/components/project-initiation-statistics"),
  ),
  "space-utilization-rate": defineAsyncComponent(async () => import("@/features/cards/park-management/components/space-utilization-rate")),
  "rental-sales-situation": defineAsyncComponent(async () => import("@/features/cards/park-management/components/rental-sales-situation")),
  "trend-park-rental": defineAsyncComponent(async () => import("@/features/cards/park-management/components/trend-park-rental")),
  /** 视频巡逻 */
  "video-patrol-statistics": defineAsyncComponent(async () => import("@/features/cards/video-patrol/video-patrol-statistics")), //视频巡逻统计
  "video-patrol-routes": defineAsyncComponent(async () => import("@/features/cards/video-patrol/video-patrol-routes")), //视频巡逻路线
  "patrol-anomaly-statistics": defineAsyncComponent(async () => import("@/features/cards/video-patrol/patrol-anomaly-statistics")), //巡逻异常统计
  "patrol-point-ranking-list": defineAsyncComponent(async () => import("@/features/cards/video-patrol/patrol-point-ranking-list")), //巡逻点位排行榜
  "distribution-patrol-time": defineAsyncComponent(async () => import("@/features/cards/video-patrol/distribution-patrol-time")), //巡逻时间分布
  "patrol-personnel-point-statistics": defineAsyncComponent(
    async () => import("@/features/cards/video-patrol/patrol-personnel-point-statistics"),
  ), //巡逻人员点位统计
  "patrol-route-details": defineAsyncComponent(async () => import("@/features/cards/video-patrol/patrol-route-details")), //巡逻路线详情
  /** 导览详情 */
  "guide-details": defineAsyncComponent(async () => import("@/features/cards/video-patrol/guide-details")), //导览详情
  /** 便捷通行 */
  "trend-pedestrian-flow": defineAsyncComponent(async () => import("@/features/cards/convenient-access/trend-pedestrian-flow")), //人流通行趋势
  "vehicle-trends": defineAsyncComponent(async () => import("@/features/cards/convenient-access/vehicle-trends")), //车流趋势
  "traffic-trends": defineAsyncComponent(async () => import("@/features/cards/convenient-access/traffic-trends")), //通行数据
  "stranded-vehicles-analysis": defineAsyncComponent(async () => import("@/features/cards/convenient-access/stranded-vehicles-analysis")), //滞留车辆分析
  "overview-security-situation": defineAsyncComponent(
    async () => import("@/features/cards/comprehensive-protection/overview-security-situationV2"),
  ), //安全态势总览
  "personnel-entry-situation": defineAsyncComponent(
    async () => import("@/features/cards/comprehensive-protection/personnel-entry-situation"),
  ), //人员出入情况
  "access-control-situation": defineAsyncComponent(
    async () => import("@/features/cards/comprehensive-protection/access-control-situation"),
  ), //门禁通行情况
  "abnormal-traffic-trend": defineAsyncComponent(async () => import("@/features/cards/park-situation/abnormal-traffic-trend")), //异常通行趋势
  "real-time-indicator-trend-analysis": defineAsyncComponent(
    async () => import("@/features/cards/environmental-monitoring/components/environmental-trend-analysis"),
  ), //实时环境指标趋势分析
  "campus-introduction": defineAsyncComponent(async () => import("@/features/cards/court-panel/court-overview/campus-introduction")),
  "energy-carbon-emissions": defineAsyncComponent(
    async () => import("@/features/cards/court-panel/court-overview/energy-carbon-emissions"),
  ),
  // 法院-法庭
  "campus-security-left": defineAsyncComponent(async () => import("@/features/cards/court-panel/campus-security/left")),
  "campus-security-right": defineAsyncComponent(async () => import("@/features/cards/court-panel/campus-security/right")),
  // 法院司法空间
  "judicial-space-left": defineAsyncComponent(async () => import("@/features/cards/court-panel/judicial-space/left")),
  "judicial-space-right": defineAsyncComponent(async () => import("@/features/cards/court-panel/judicial-space/right")),
  // 法治宣传
  "judicial-situation-overview-left": defineAsyncComponent(
    async () => import("@/features/cards/court-panel/judicial-situation-overview/left"),
  ),
  "judicial-situation-overview-right": defineAsyncComponent(
    async () => import("@/features/cards/court-panel/judicial-situation-overview/right"),
  ),
  // 民事态势
  "work-order-statistics": defineAsyncComponent(async () => import("@/features/cards/public-security/work-order-statistics")),
  briefIntroduction: defineAsyncComponent(async () => import("@/features/cards/public-security/briefIntroduction")),
  // 访客预约统计
  appointmentsNumber: defineAsyncComponent(async () => import("@/features/cards/public-security/appointmentsNumber")),
  // 访客车辆数统计
  visitorVehicles: defineAsyncComponent(async () => import("@/features/cards/public-security/visitor-vehicles")),
  // 报修区域
  "warranty-area": defineAsyncComponent(async () => import("@/features/cards/public-security/warranty-area")),
  // 人员清点
  "access-overview": defineAsyncComponent(async () => import("@/features/cards/personnelCounting/access-overview")),
  // 人员实时通行数据
  "traffic-data": defineAsyncComponent(async () => import("@/features/cards/personnelCounting/traffic-data")),
  // 车位总览
  "overview-parking-spaces": defineAsyncComponent(async () => import("@/features/cards/personnelCounting/overview-parking-spaces")),
  // 车流趋势
  "traffic-flow-trend": defineAsyncComponent(async () => import("@/features/cards/personnelCounting/traffic-flow-trend")),
  // 滞留车辆分析
  "analysis-stranded-vehicles": defineAsyncComponent(async () => import("@/features/cards/personnelCounting/analysis-stranded-vehicles")),
  // 设备详情面板
  "patrol-task-statistics": defineAsyncComponent(
    async () => import("@/features/cards/security-monitoring-safty/cards/patrol-task-statistics"),
  ),
  "asset-overview": defineAsyncComponent(async () => import("@/features/cards/asset-management/asset-overview")),
  // 部门资产分布情况
  "distribution-departmental-assets": defineAsyncComponent(
    async () => import("@/features/cards/asset-management/distribution-departmental-assets"),
  ),
  // 区域资产分布情况
  "regional-asset-distribution": defineAsyncComponent(async () => import("@/features/cards/asset-management/regional-asset-distribution")),
  // 资产状态占比
  "proportion-asset-status": defineAsyncComponent(async () => import("@/features/cards/asset-management/proportion-asset-status")),
  // 资产分类占比
  "proportion-asset-classification": defineAsyncComponent(
    async () => import("@/features/cards/asset-management/proportion-asset-classification"),
  ),
  // 耗材出库趋势
  "trend-consumables-outbound": defineAsyncComponent(async () => import("@/features/cards/asset-management/trend-consumables-outbound")),
  "carbon-emission-ratio": defineAsyncComponent(async () => import("@/features/cards/energy-consumption/components/carbon-emission-ratio")),
  // 区域综合能耗排名Top10
  "carbon-ranking-top10": defineAsyncComponent(async () => import("@/features/cards/energy-consumption/components/carbon-ranking-top10")),
  // 区域综合能耗排名Top5
  "carbon-ranking-top5": defineAsyncComponent(async () => import("@/features/cards/energy-consumption/components/carbon-ranking-top5")),
  // 碳排量趋势图
  "carbon-trends": defineAsyncComponent(async () => import("@/features/cards/energy-consumption/components/carbon-trends")),
  // 综合能耗分类占比
  "energy-consumption-proportion": defineAsyncComponent(
    async () => import("@/features/cards/energy-consumption/components/energy-consumption-proportion"),
  ),
  // 能耗用能趋势图
  "energy-consumption-trend": defineAsyncComponent(
    async () => import("@/features/cards/energy-consumption/components/energy-consumption-trend"),
  ),
  // 全年能耗概览
  "energy-overview": defineAsyncComponent(async () => import("@/features/cards/energy-consumption/components/energy-overview")),
  // 区域用能排名Top10
  "energy-ranking-top10": defineAsyncComponent(async () => import("@/features/cards/energy-consumption/components/energy-ranking-top10")),
  // 区域用能排名Top5
  "energy-ranking-top5": defineAsyncComponent(async () => import("@/features/cards/energy-consumption/components/energy-ranking-top5")),
  // 能耗用能统计
  "energy-statistics": defineAsyncComponent(async () => import("@/features/cards/energy-consumption/components/energy-statistics")),
  // 能耗用能统计
  "energy-analysis": defineAsyncComponent(async () => import("@/features/cards/energy-consumption/components/energy-analysis")),
  // 综合能耗趋势图
  "energy-trend": defineAsyncComponent(async () => import("@/features/cards/energy-consumption/components/energy-trend")),
  // 区域碳排量排名Top10
  "ranking-comprehensive-consumption-top10": defineAsyncComponent(
    async () => import("@/features/cards/energy-consumption/components/ranking-comprehensive-consumption-top10"),
  ),
  // 区域碳排量排名Top5
  "ranking-comprehensive-consumption-top5": defineAsyncComponent(
    async () => import("@/features/cards/energy-consumption/components/ranking-comprehensive-consumption-top5"),
  ),
  // 分项用能占比
  "sub-proportion": defineAsyncComponent(async () => import("@/features/cards/energy-consumption/components/sub-proportion")),
  // 年度用能趋势图
  "annual-energy-consumption-trend": defineAsyncComponent(
    async () => import("@/features/cards/energy-consumption/components/annual-energy-consumption-trend"),
  ),
  "public-alarm-situation": defineAsyncComponent(
    async () => import("@/features/cards/energy-consumption/components/annual-energy-consumption-trend"),
  ),
  // 报警统计(饼图)
  "property-income-details": defineAsyncComponent(async () => import("@/features/cards/estate-management/property-income-details")),
  // 物业收支对比
  "comparison-property-revenue": defineAsyncComponent(async () => import("@/features/cards/estate-management/comparison-property-revenue")),
  // 物业收入总览
  "overview-property-revenue": defineAsyncComponent(async () => import("@/features/cards/estate-management/overview-property-revenue")),
  // 企业数量统计
  "statistics-number-enterprises": defineAsyncComponent(
    async () => import("@/features/cards/estate-management/statistics-number-enterprises"),
  ),
  // 物业收入汇总
  "summary-property-revenue": defineAsyncComponent(async () => import("@/features/cards/estate-management/summary-property-revenue")),
  // 企业入驻趋势
  "trend-enterprise-settlement": defineAsyncComponent(async () => import("@/features/cards/estate-management/trend-enterprise-settlement")),
  "consumer-statistics": defineAsyncComponent(async () => import("@/features/cards/restaurant/consumer-statistics")),
  // 消费金额趋势图
  "display-consumption-amount": defineAsyncComponent(async () => import("@/features/cards/restaurant/display-consumption-amount")),
  // 人均消费金额统计
  "per-capita-consumption-amount-statistics": defineAsyncComponent(
    async () => import("@/features/cards/restaurant/per-capita-consumption-amount-statistics"),
  ),
  // 场所消费金额占比
  "proportion-consumption-amount": defineAsyncComponent(async () => import("@/features/cards/restaurant/proportion-consumption-amount")),
  // 账户消费Top10
  "top-count-consumption": defineAsyncComponent(async () => import("@/features/cards/restaurant/top-count-consumption")),
  // 消费金额展示
  "trend-consumption-amount": defineAsyncComponent(async () => import("@/features/cards/restaurant/trend-consumption-amount")),
  "squatting-occupancy-situation": defineAsyncComponent(
    async () => import("@/features/cards/toilet-management/squatting-occupancy-situation"),
  ),
  "list-high-risk-personnel": defineAsyncComponent(async () => import("@/features/cards/staff-management/list-high-risk-personnel")),
  // 在矫对象概况
  "overview-correction-object": defineAsyncComponent(async () => import("@/features/cards/staff-management/overview-correction-object")),
  // 外来人员概况
  "overview-external-personnel": defineAsyncComponent(async () => import("@/features/cards/staff-management/overview-external-personnel")),
  // 师生比例
  "overview-police-force": defineAsyncComponent(async () => import("@/features/cards/staff-management/overview-police-force")),
  // 超时未出人员信息
  "personnel-information-released-timeout": defineAsyncComponent(
    async () => import("@/features/cards/staff-management/personnel-information-released-timeout"),
  ),
  // 在矫对象风险等级占比
  "proportion-risk-level-correction-object": defineAsyncComponent(
    async () => import("@/features/cards/staff-management/proportion-risk-level-correction-object"),
  ),
  // 学生点名记录
  "statistics-correction-object": defineAsyncComponent(
    async () => import("@/features/cards/staff-management/statistics-correction-objects"),
  ),
  // 老师进出记录
  "police-statistics": defineAsyncComponent(async () => import("@/features/cards/staff-management/police-statistics")),
  // 外来人员统计
  "statistics-external-personnel": defineAsyncComponent(
    async () => import("@/features/cards/staff-management/statistics-external-personnel"),
  ),
  // 今日宿舍点名情况
  "today-dormitory-roll-call-situation": defineAsyncComponent(
    async () => import("@/features/cards/staff-management/today-dormitory-roll-call-situation"),
  ),
  "small-statistics": defineAsyncComponent(async () => import("@/features/cards/small-engineering/small-statistics")),
  // 工程整改统计
  "engineering-rectification-statistics": defineAsyncComponent(
    async () => import("@/features/cards/small-engineering/engineering-rectification-statistics"),
  ),
  // 工程巡查统计
  "engineering-inspection-statistics": defineAsyncComponent(
    async () => import("@/features/cards/small-engineering/engineering-inspection-statistics"),
  ),
  // 工程巡查异常统计
  "abnormal-statistics-engineering-inspection": defineAsyncComponent(
    async () => import("@/features/cards/small-engineering/abnormal-statistics-engineering-inspection"),
  ),
  "electric-vehicle-registration-statistics": defineAsyncComponent(
    async () => import("@/features/cards/electricVehicle/electric-vehicle-registration-statistics"),
  ),
  // 电瓶车违规入电梯统计
  "electric-vehicles-illegally-entering-elevators": defineAsyncComponent(
    async () => import("@/features/cards/electricVehicle/electric-vehicles-illegally-entering-elevators"),
  ),
  // 电动车违规充电统计
  "statistics-illegal-charging-electric-vehicles": defineAsyncComponent(
    async () => import("@/features/cards/electricVehicle/statistics-illegal-charging-electric-vehicles"),
  ),
  // 电动车违规停放统计
  "statistics-illegal-parking-electric-vehicles": defineAsyncComponent(
    async () => import("@/features/cards/electricVehicle/statistics-illegal-parking-electric-vehicles"),
  ),
  // 电瓶车违规占比
  "violation-statistics-electric-vehicles": defineAsyncComponent(
    async () => import("@/features/cards/electricVehicle/violation-statistics-electric-vehicles"),
  ),
  // 电梯运行分析
  "elevator-analysis-panel": defineAsyncComponent(
    async () => import("@/features/cards/security-situationNew/components/elevator-analysis-panel"),
  ),
  "call-statistics-panel": defineAsyncComponent(
    async () => import("@/features/cards/medical-intercom/overview-medical-intercom/components/call-statistics-panel"),
  ),
  // 呼叫趋势
  "call-trends": defineAsyncComponent(
    async () => import("@/features/cards/medical-intercom/overview-medical-intercom/components/call-trends"),
  ),
  // 呼叫时段分布
  "distribution-call-time-periods": defineAsyncComponent(
    async () => import("@/features/cards/medical-intercom/overview-medical-intercom/components/distribution-call-time-periods"),
  ),
  "visiting-data-panel": defineAsyncComponent(async () => import("@/features/cards/triage-queue/components/visiting-data-panel")),
  // 接诊趋势
  "reception-trends-panel": defineAsyncComponent(async () => import("@/features/cards/triage-queue/components/reception-trends-panel")),
  // 候诊情况
  "waiting-situation-panel": defineAsyncComponent(async () => import("@/features/cards/triage-queue/components/waiting-situation-panel")),
  // 预约就诊分布
  "appointment-visit-distribution-panel": defineAsyncComponent(
    async () => import("@/features/cards/triage-queue/components/appointment-visit-distribution-panel"),
  ),
  // 院区介绍
  "introduction-of-hospital": defineAsyncComponent(async () => import("@/features/cards/triage-queue/components/introduction-of-hospital")),
  // 今日气体使用概览
  "today-gas-usage": defineAsyncComponent(async () => import("@/features/cards/medical-gas-new/cards/today-gas-usage")),
  // 气体用量情况
  "gas-usage-situation": defineAsyncComponent(async () => import("@/features/cards/medical-gas-new/cards/gas-usage-situation")),
  // 气体使用趋势
  "gas-usage-trend": defineAsyncComponent(async () => import("@/features/cards/medical-gas-new/cards/gas-usage-trend")),
  // 报警态势
  "hospital-alarm-situation": defineAsyncComponent(async () => import("@/features/cards/children-hospital/cards/alarm-stats")),
  // 报警趋势
  "hospital-alarm-trend": defineAsyncComponent(async () => import("@/features/cards/children-hospital/cards/alarm-trend")),
  // 示教情况总览
  "teaching-overview": defineAsyncComponent(async () => import("@/features/cards/surgical-demonstration-new/cards/teaching-overview")),
  // 示教直播场次
  "teaching-live-sessions": defineAsyncComponent(
    async () => import("@/features/cards/surgical-demonstration-new/cards/teaching-live-sessions"),
  ),
  // 最受欢迎视频Top10
  "popular-videos": defineAsyncComponent(async () => import("@/features/cards/surgical-demonstration-new/cards/popular-videos")),
  "trend-vehicle-flow-driving-out": defineAsyncComponent(
    async () => import("@/features/cards/stop-manage/stop-general-manage-right/trend-vehicle-flow-driving-out"),
  ),
  //  实时出入记录
  "real-time-access-records": defineAsyncComponent(
    async () => import("@/features/cards/stop-manage/stop-general-manage-right/real-time-access-records"),
  ),
  //  出入统计
  "entry-and-exit-records": defineAsyncComponent(
    async () => import("@/features/cards/stop-manage/stop-general-manage-right/entry-and-exit-records"),
  ),
  // 设备实时状态
  "device-realtime-status": defineAsyncComponent(async () => import("@/features/cards/access-control/cards/device-realtime-status")),
  // 异常事件top5
  "abnormal-event-top5": defineAsyncComponent(async () => import("@/features/cards/access-control/cards/abnormal-event-top5")),
  // 异常通行趋势
  "abnormal-traffic-trend-new": defineAsyncComponent(async () => import("@/features/cards/access-control/cards/abnormal-traffic-trend")),
  // 人流通行趋势
  "personnel-traffic-trend": defineAsyncComponent(async () => import("@/features/cards/access-control/cards/personnel-traffic-trend")),
  // 通行分析
  "passage-analysis": defineAsyncComponent(async () => import("@/features/cards/access-control/cards/passage-analysis")),
  // 实时通行数据
  "real-time-passage-data": defineAsyncComponent(async () => import("@/features/cards/access-control/cards/real-time-passage-data")),
  "merchant-gear-stats": defineAsyncComponent(async () => import("@/features/cards/merchant-manage/cards/merchant-gear-stats")),
  // 商户清单
  "merchant-list-card": defineAsyncComponent(async () => import("@/features/cards/merchant-manage/cards/merchant-list-card")),
  // 区域档位数
  "area-gear-count": defineAsyncComponent(async () => import("@/features/cards/merchant-manage/cards/area-gear-count")),
  // 问卷调查统计
  "questionnaire-stats": defineAsyncComponent(async () => import("@/features/cards/merchant-manage/cards/questionnaire-stats")),
  // 诚信经营占比
  "honesty-proportion": defineAsyncComponent(async () => import("@/features/cards/merchant-manage/cards/honesty-proportion")),
  // 诚信经营值统计
  "honesty-stats": defineAsyncComponent(async () => import("@/features/cards/merchant-manage/cards/honesty-stats")),
  // 商户合同统计
  "contract-stats": defineAsyncComponent(async () => import("@/features/cards/merchant-manage/cards/contract-stats")),
  "broadcast-record-ranking": defineAsyncComponent(async () => import("@/features/cards/broadcast/cards/record-ranking")),
  // 广播记录趋势
  "broadcast-record-trend": defineAsyncComponent(async () => import("@/features/cards/broadcast/cards/record-trend")),
  // 最新记录明细
  "broadcast-latest-records": defineAsyncComponent(async () => import("@/features/cards/broadcast/cards/latest-records")),
  "boiler-data-overview": defineAsyncComponent(async () => import("@/features/cards/boiler/cards/data-overview")),
  // 实时温度趋势
  "boiler-temperature-trend": defineAsyncComponent(async () => import("@/features/cards/boiler/cards/temperature-trend")),
  // 用水趋势
  "boiler-water-trend": defineAsyncComponent(async () => import("@/features/cards/boiler/cards/water-trend")),
  // 用电趋势
  "boiler-energy-trend": defineAsyncComponent(async () => import("@/features/cards/boiler/cards/energy-trend")),
  // 设备统计
  "boiler-device-stats": defineAsyncComponent(async () => import("@/features/cards/boiler/cards/device-stats")),
  // 超温统计
  "boiler-over-temperature-stats": defineAsyncComponent(async () => import("@/features/cards/boiler/cards/over-temperature-stats")),
  // 设备报警
  "boiler-device-alarm": defineAsyncComponent(async () => import("@/features/cards/boiler/cards/device-alarm")),
  // 水处理实时数据
  "water-treatment-realtime": defineAsyncComponent(async () => import("@/features/cards/sewage-disposal/cards/water-treatment-realtime")),
  "lift-stats": defineAsyncComponent(async () => import("@/features/cards/lift-manage/cards/lift-stats")),
  // 运行分析
  "lift-operation-analysis": defineAsyncComponent(async () => import("@/features/cards/lift-manage/cards/lift-operation-analysis")),
  // 电梯状态监测
  "lift-status-monitor": defineAsyncComponent(async () => import("@/features/cards/lift-manage/cards/lift-status-monitor")),
  // 电梯报警等级统计
  "lift-alarm-level-stats": defineAsyncComponent(async () => import("@/features/cards/lift-manage/cards/lift-alarm-level-stats")),
  // 电梯设备报警趋势
  "lift-device-alarm-trend": defineAsyncComponent(async () => import("@/features/cards/lift-manage/cards/lift-device-alarm-trend")),
  // 最新五方通话
  "latest-five-way-call": defineAsyncComponent(async () => import("@/features/cards/lift-manage/cards/latest-five-way-call")),
  "logistics-device-status-distribution": defineAsyncComponent(
    async () => import("@/features/cards/logistics/cards/logistics-device-status-distribution"),
  ),
  // 设备在线情况
  "logistics-device-online-status": defineAsyncComponent(
    async () => import("@/features/cards/logistics/cards/logistics-device-online-status"),
  ),
  "passenger-flow-overview": defineAsyncComponent(async () => import("@/features/cards/passenger-flow/cards/passenger-flow-overview")),
  // 各区域客流量排名
  "passenger-flow-ranking": defineAsyncComponent(async () => import("@/features/cards/passenger-flow/cards/passenger-flow-ranking")),
  // 客流分析图
  "passenger-flow-analysis": defineAsyncComponent(async () => import("@/features/cards/passenger-flow/cards/passenger-flow-analysis")),
  // 各个区域客流量
  "passenger-flow-regional": defineAsyncComponent(async () => import("@/features/cards/passenger-flow/cards/passenger-flow-regional")),
  "garden-device-online-status": defineAsyncComponent(async () => import("@/features/cards/gardens/cards/garden-device-online-status")),
  "park-space-utilization": defineAsyncComponent(async () => import("@/features/cards/park-management/cards/park-space-utilization")),
  // 楼栋空间利用率
  "park-building-space-utilization": defineAsyncComponent(
    async () => import("@/features/cards/park-management/cards/park-building-space-utilization"),
  ),
  // 租赁企业行业情况统计
  "park-enterprise-industry-stats": defineAsyncComponent(
    async () => import("@/features/cards/park-management/cards/park-enterprise-industry-stats"),
  ),
  // 园区租赁总情况
  "park-leasing-overview": defineAsyncComponent(async () => import("@/features/cards/park-management/cards/park-leasing-overview")),
  // 园区租赁趋势
  "park-leasing-trends": defineAsyncComponent(async () => import("@/features/cards/park-management/cards/park-leasing-trends")),
  // 园区楼层租赁比情况
  "park-floor-leasing-ratio": defineAsyncComponent(async () => import("@/features/cards/park-management/cards/park-floor-leasing-ratio")),
  "meeting-availability": defineAsyncComponent(async () => import("@/features/cards/management-meetings/cards/meeting-availability")),
  // 预定时段分析
  "booking-period-analysis": defineAsyncComponent(async () => import("@/features/cards/management-meetings/cards/booking-period-analysis")),
  // 会议室利用率分析
  "meeting-room-utilization": defineAsyncComponent(
    async () => import("@/features/cards/management-meetings/cards/meeting-room-utilization"),
  ),
  "latest-emergency-calls": defineAsyncComponent(async () => import("@/features/cards/emergency-phone/cards/latest-emergency-calls")),
  // 电话使用趋势
  "call-usage-trends": defineAsyncComponent(async () => import("@/features/cards/emergency-phone/cards/call-usage-trends")),
  // 设备在线情况
  "call-device-online-status": defineAsyncComponent(async () => import("@/features/cards/emergency-phone/cards/device-online-status")),
  "traffic-light-device-online-status": defineAsyncComponent(
    async () => import("@/features/cards/traffic-light/cards/traffic-light-device-online-status"),
  ),
  "traffic-control-device-online-status": defineAsyncComponent(
    async () => import("@/features/cards/traffic-light/cards/traffic-light-device-online-status"),
  ),
  "tunnel-today-traffic-flow": defineAsyncComponent(async () => import("@/features/cards/traffic-volume/cards/tunnel-today-traffic-flow")),
  // 隧道不同车道车流量分析
  "tunnel-lane-traffic-flow": defineAsyncComponent(async () => import("@/features/cards/traffic-volume/cards/tunnel-lane-traffic-flow")),
  // 断面实时平均车速分析
  "section-realtime-speed": defineAsyncComponent(async () => import("@/features/cards/traffic-volume/cards/section-realtime-speed")),
  "emergency-supplies-status": defineAsyncComponent(
    async () => import("@/features/cards/emergency-resources/cards/emergency-supplies-status"),
  ),
  // 应急物资在库统计
  "emergency-supplies-stock": defineAsyncComponent(
    async () => import("@/features/cards/emergency-resources/cards/emergency-supplies-stock"),
  ),
  // 应急资金趋势统计
  "emergency-funds-trend": defineAsyncComponent(async () => import("@/features/cards/emergency-resources/cards/emergency-funds-trend")),
  // 应急人员统计
  "emergency-personnel-stats": defineAsyncComponent(
    async () => import("@/features/cards/emergency-resources/cards/emergency-personnel-stats"),
  ),
  // 应急设备统计
  "emergency-equipment-stats": defineAsyncComponent(
    async () => import("@/features/cards/emergency-resources/cards/emergency-equipment-stats"),
  ),
  // 应急设施使用率
  "emergency-facility-usage": defineAsyncComponent(
    async () => import("@/features/cards/emergency-resources/cards/emergency-facility-usage"),
  ),
  "smart-card-status-stats": defineAsyncComponent(async () => import("@/features/cards/smart-card/cards/smart-card-status-stats")),
  // 来访人员趋势图
  "smart-visitor-trends": defineAsyncComponent(async () => import("@/features/cards/smart-card/cards/smart-visitor-trends")),
  // 门禁事件Top10
  "smart-access-events-top10": defineAsyncComponent(async () => import("@/features/cards/smart-card/cards/smart-access-events-top10")),
  // 梯控事件Top10
  "smart-elevator-events-top10": defineAsyncComponent(async () => import("@/features/cards/smart-card/cards/smart-elevator-events-top10")),
  // 可视对讲事件Top10
  "smart-intercom-events-top10": defineAsyncComponent(async () => import("@/features/cards/smart-card/cards/smart-intercom-events-top10")),
  "tunnel-environment-realtime": defineAsyncComponent(
    async () => import("@/features/cards/environmental-monitoring/cards/tunnel-environment-realtime"),
  ),
  // 隧道CO浓度趋势分析
  "tunnel-co-trend-analysis": defineAsyncComponent(
    async () => import("@/features/cards/environmental-monitoring/cards/tunnel-co-trend-analysis"),
  ),
  // 实时隧道环境指标趋势分析
  "realtime-environment-trend-analysis": defineAsyncComponent(
    async () => import("@/features/cards/environmental-monitoring/cards/realtime-environment-trend-analysis"),
  ),
  "transaction-overview": defineAsyncComponent(async () => import("@/features/cards/consumption/cards/transaction-overview")),
  // 金额交易趋势图
  "transaction-trend": defineAsyncComponent(async () => import("@/features/cards/consumption/cards/transaction-trend")),
  // 账户消费Top10
  "account-consumption-top10": defineAsyncComponent(async () => import("@/features/cards/consumption/cards/account-consumption-top10")),
  // 份额交易概览
  "share-transaction-overview": defineAsyncComponent(async () => import("@/features/cards/consumption/cards/share-transaction-overview")),
  // 份额交易趋势图
  "share-transaction-trend": defineAsyncComponent(async () => import("@/features/cards/consumption/cards/share-transaction-trend")),
  // 账户实时状态统计
  "account-status-stats": defineAsyncComponent(async () => import("@/features/cards/consumption/cards/account-status-stats")),
  "electricity-usage-trend": defineAsyncComponent(async () => import("@/features/cards/Prepaid/cards/electricity-usage-trend")),
  // 失联电表实时统计
  "lost-electricity-meter-stats": defineAsyncComponent(async () => import("@/features/cards/Prepaid/cards/lost-electricity-meter-stats")),
  // 欠费电表占比
  "arrears-electricity-meter-stats": defineAsyncComponent(
    async () => import("@/features/cards/Prepaid/cards/arrears-electricity-meter-stats"),
  ),
  // 水表日用能趋势图
  "prepaid-water-usage-trend": defineAsyncComponent(async () => import("@/features/cards/Prepaid/cards/water-usage-trend")),
  // 失联水表实时统计
  "lost-water-meter-stats": defineAsyncComponent(async () => import("@/features/cards/Prepaid/cards/lost-water-meter-stats")),
  // 欠费水表占比
  "arrears-water-meter-stats": defineAsyncComponent(async () => import("@/features/cards/Prepaid/cards/arrears-water-meter-stats")),
  "star-order-distribution": defineAsyncComponent(async () => import("@/features/cards/delivery/cards/star-order-distribution")),
  // 订单趋势统计
  "star-order-trend": defineAsyncComponent(async () => import("@/features/cards/delivery/cards/star-order-trend")),
  // 用户分布统计
  "star-user-distribution": defineAsyncComponent(async () => import("@/features/cards/delivery/cards/star-user-distribution")),
  // 用户趋势统计
  "star-user-trend": defineAsyncComponent(async () => import("@/features/cards/delivery/cards/star-user-trend")),
  // 营收分布统计
  "star-revenue-distribution": defineAsyncComponent(async () => import("@/features/cards/delivery/cards/star-revenue-distribution")),
  // 营收趋势统计
  "star-revenue-trend": defineAsyncComponent(async () => import("@/features/cards/delivery/cards/star-revenue-trend")),
  // 实时评价
  "star-realtime-evaluation": defineAsyncComponent(async () => import("@/features/cards/delivery/cards/star-realtime-evaluation")),
  "meat-transaction-top5": defineAsyncComponent(async () => import("@/features/cards/meat-trading/cards/meat-transaction-top5")),
  // 屠宰场供货TOP
  "meat-slaughterhouse-supply-top": defineAsyncComponent(
    async () => import("@/features/cards/meat-trading/cards/meat-slaughterhouse-supply-top"),
  ),
  // 交易信息
  "meat-transaction-info": defineAsyncComponent(async () => import("@/features/cards/meat-trading/cards/meat-transaction-info")),
  // 供货信息
  "meat-supply-info": defineAsyncComponent(async () => import("@/features/cards/meat-trading/cards/meat-supply-info")),
  // 食安信息
  "meat-food-safety-info": defineAsyncComponent(async () => import("@/features/cards/meat-trading/cards/meat-food-safety-info")),
  // 来货报备
  "meat-food-safety-floor": defineAsyncComponent(async () => import("@/features/cards/meat-trading/cards/meat-food-safety-floor")),
  // 批次作弊嫌疑率
  "meat-batch-suspicion-rate": defineAsyncComponent(async () => import("@/features/cards/meat-trading/cards/meat-batch-suspicion-rate")),
  // 设备数据
  "meat-device-data": defineAsyncComponent(async () => import("@/features/cards/meat-trading/cards/meat-device-data")),
  // 白条交易数据
  "meat-white-stripe-transaction-data": defineAsyncComponent(
    async () => import("@/features/cards/meat-trading/cards/meat-white-stripe-transaction-data"),
  ),
  // 理货审核率
  "meat-tally-audit-rate": defineAsyncComponent(async () => import("@/features/cards/meat-trading/cards/meat-tally-audit-rate")),
  // 天津
  "tianjin-transaction-top5": defineAsyncComponent(async () => import("@/features/cards/meat-trading/cards/tianjin-transaction-top5")),
  // 屠宰场供货TOP
  "tianjin-slaughterhouse-supply-top": defineAsyncComponent(
    async () => import("@/features/cards/meat-trading/cards/tianjin-slaughterhouse-supply-top"),
  ),
  // 交易信息
  "tianjin-transaction-info": defineAsyncComponent(async () => import("@/features/cards/meat-trading/cards/tianjin-transaction-info")),
  // 供货信息
  "tianjin-supply-info": defineAsyncComponent(async () => import("@/features/cards/meat-trading/cards/tianjin-supply-info")),
  // 食安信息
  "tianjin-food-safety-info": defineAsyncComponent(async () => import("@/features/cards/meat-trading/cards/tianjin-food-safety-info")),
  // 来货报备
  "tianjin-food-safety-floor": defineAsyncComponent(async () => import("@/features/cards/meat-trading/cards/tianjin-food-safety-floor")),
  // 批次作弊嫌疑率
  "tianjin-batch-suspicion-rate": defineAsyncComponent(
    async () => import("@/features/cards/meat-trading/cards/tianjin-batch-suspicion-rate"),
  ),
  // 设备数据
  "tianjin-device-data": defineAsyncComponent(async () => import("@/features/cards/meat-trading/cards/tianjin-device-data")),
  // 白条交易数据
  "tianjin-white-stripe-transaction-data": defineAsyncComponent(
    async () => import("@/features/cards/meat-trading/cards/tianjin-white-stripe-transaction-data"),
  ),
  // 理货数据
  "tianjin-tally-data": defineAsyncComponent(async () => import("@/features/cards/meat-trading/cards/tianjin-tally-data")),
  // 理货审核率
  "tianjin-tally-audit-rate": defineAsyncComponent(async () => import("@/features/cards/meat-trading/cards/meat-tally-audit-rate")),
  "lighting-circuit-status": defineAsyncComponent(async () => import("@/features/cards/lighting/cards/lighting-circuit-status")),
  // 群控组实时数据
  "group-control-realtime-data": defineAsyncComponent(async () => import("@/features/cards/lighting/cards/group-control-realtime-data")),
  // 时控实时数据
  "time-control-realtime-data": defineAsyncComponent(async () => import("@/features/cards/lighting/cards/time-control-realtime-data")),
  // 信息发布
  "information-publish": defineAsyncComponent(async () => import("@/features/cards/operation/cards/information-publish")),

  // 教务态势
  // 教务态势
  ...educational_situation_cards,
  // 安全管理
  ...safety_manage_cards,

  // 预案演练
  "emergency-drill": defineAsyncComponent(
    async () => (await import("@/features/widgets/business-cards/emergency-drill/emergency-drill")).EmergencyDrill,
  ),

  ...command_dispatch_cards,
  ...parking_car_cards,
  ...people_flow_cards,
  ...visor_panel_cards,
  ...water_purification_cards,
  ...shandong_cards,
  ...zhongda_heshun_cards,
};
