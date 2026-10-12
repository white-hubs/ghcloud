import { App, Component, defineAsyncComponent } from "vue";
/**
 * @说明 业务面板批量导入
 */
export const BusinessPanel: Record<string, Component> = {
  /**
   * @说明 粮仓(展会)
   */
  GranaryLeft: defineAsyncComponent(async () => import("./businessPanel/granary/granary-left.vue")),
  GranaryRight: defineAsyncComponent(async () => import("./businessPanel/granary/granary-right.vue")),
  /**
   * @说明 安防监控(展会)
   */
  SecurityMonitorLeftDemo: defineAsyncComponent(async () => import("./businessPanel/demo-panel/security/left.vue")),
  SecurityMonitorRightDemo: defineAsyncComponent(async () => import("./businessPanel/demo-panel/security/right.vue")),
  /**
   * 园区（展会）
   */
  HospitalHomePageLeftDemo: defineAsyncComponent(async () => import("./businessPanel/demo-panel/hospital/home-page-left.vue")),
  HospitalHomePageRightDemo: defineAsyncComponent(async () => import("./businessPanel/demo-panel/hospital/home-page-right.vue")),
  HospitalHomePageLeftCommunityDemo: defineAsyncComponent(
    async () => import("./businessPanel/demo-panel/hospital/home-page-community-left.vue"),
  ),
  HospitalHomePageRightCommunityDemo: defineAsyncComponent(
    async () => import("./businessPanel/demo-panel/hospital/home-page-community-right.vue"),
  ),
  /**
   * 运营态势（展会）
   */
  OperationManagementLeftDemo: defineAsyncComponent(async () => import("./businessPanel/demo-panel/operation-management/left.vue")),
  OperationManagementRightDemo: defineAsyncComponent(async () => import("./businessPanel/demo-panel/operation-management/right.vue")),
  /**
   * 安全态势（展会）
   */
  SecuritySituationExhibitionLeftDemo: defineAsyncComponent(async () => import("./businessPanel/demo-panel/security-situation/left.vue")),
  SecuritySituationExhibitionRightDemo: defineAsyncComponent(async () => import("./businessPanel/demo-panel/security-situation/right.vue")),
  /**
   * 运维态势（展会）
   */
  OperationLeftDemo: defineAsyncComponent(async () => import("./businessPanel/demo-panel/operation/left.vue")),
  OperationRightDemo: defineAsyncComponent(async () => import("./businessPanel/demo-panel/operation/right.vue")),
  /**
   * 能耗态势（展会）
   */
  EnergyConsumptionLeftDemo: defineAsyncComponent(async () => import("./businessPanel/demo-panel/energy-consumption/left.vue")),
  EnergyConsumptionRightDemo: defineAsyncComponent(async () => import("./businessPanel/demo-panel/energy-consumption/right.vue")),
  /**
   * 能耗态势（法院）
   */
  CourtEnergyConsumptionLeftDemo: defineAsyncComponent(async () => import("./businessPanel/court-panel/energy-consumption/left.vue")),
  CourtEnergyConsumptionRightDemo: defineAsyncComponent(async () => import("./businessPanel/court-panel/energy-consumption/right.vue")),
  /**
   * @说明 分诊排号业务面板（展会）
   */
  TriageQueueLeft: defineAsyncComponent(async () => import("./businessPanel/triage-queue/left.vue")),
  TriageQueueRight: defineAsyncComponent(async () => import("./businessPanel/triage-queue/right.vue")),
  TriageQueueFloorLeft: defineAsyncComponent(async () => import("./businessPanel/triage-queue/floor-left.vue")),
  TriageQueueFloorRight: defineAsyncComponent(async () => import("./businessPanel/triage-queue/floor-right.vue")),

  /**
   * @说明 医用气体业务面板（展会）
   */
  MedicalGasLeft: defineAsyncComponent(async () => import("./businessPanel/medical-gas/left.vue")),
  MedicalGasRight: defineAsyncComponent(async () => import("./businessPanel/medical-gas/right.vue")),
  MedicalGasBuildLeft: defineAsyncComponent(async () => import("./businessPanel/medical-gas/build-left.vue")),
  MedicalGasBuildRight: defineAsyncComponent(async () => import("./businessPanel/medical-gas/build-right.vue")),

  /**
   * @说明 医护对讲业务面板 (展会)
   */
  MedicalIntercomLeft: defineAsyncComponent(async () => import("./businessPanel/medical-intercom/left.vue")),
  MedicalIntercomRight: defineAsyncComponent(async () => import("./businessPanel/medical-intercom/right.vue")),
  MedicalIntercomBuildLeft: defineAsyncComponent(async () => import("./businessPanel/medical-intercom/build-left.vue")),
  MedicalIntercomBuildRight: defineAsyncComponent(async () => import("./businessPanel/medical-intercom/build-right.vue")),
  MedicalIntercomFloorLeft: defineAsyncComponent(async () => import("./businessPanel/medical-intercom/floor-left.vue")),
  MedicalIntercomFloorRight: defineAsyncComponent(async () => import("./businessPanel/medical-intercom/floor-right.vue")),

  /**
   * @说明 智能照明业务面板 (展会)
   */
  IntelligentLightingLeft: defineAsyncComponent(async () => import("./businessPanel/intelligent-lighting/left.vue")),
  IntelligentLightingRight: defineAsyncComponent(async () => import("./businessPanel/intelligent-lighting/right.vue")),
  IntelligentLightingBuildLeft: defineAsyncComponent(async () => import("./businessPanel/intelligent-lighting/build-left.vue")),
  IntelligentLightingBuildRight: defineAsyncComponent(async () => import("./businessPanel/intelligent-lighting/build-right.vue")),
  IntelligentLightingFloorLeft: defineAsyncComponent(async () => import("./businessPanel/intelligent-lighting/floor-left.vue")),
  IntelligentLightingFloorRight: defineAsyncComponent(async () => import("./businessPanel/intelligent-lighting/floor-right.vue")),

  /**
   * @说明 安全管理业务面板
   */

  SecurityManagementLeft: defineAsyncComponent(async () => import("./businessPanel/demo-panel-layout/security-management/left.vue")),
  SecurityManagementRight: defineAsyncComponent(async () => import("./businessPanel/demo-panel-layout/security-management/right.vue")),
  /**
   * @说明 指挥调度业务面板
   */
  CommandDispatchLeft: defineAsyncComponent(async () => import("./businessPanel/command-dispatch/left.vue")),
  CommandDispatchRight: defineAsyncComponent(async () => import("./businessPanel/command-dispatch/right.vue")),
  CommandDispatchBuildLeft: defineAsyncComponent(async () => import("./businessPanel/command-dispatch/build-left.vue")),
  CommandDispatchBuildRight: defineAsyncComponent(async () => import("./businessPanel/command-dispatch/build-right.vue")),
  // CommandDispatchFloorRight:defineAsyncComponent(async () =>import('./businessPanel/commandDispatch/floorRight.vue')),
  /**
   * @说明 安防监控业务面板
   */
  SecurityMonitorLeft: defineAsyncComponent(async () => import("./businessPanel/security/left.vue")),
  SecurityMonitorRight: defineAsyncComponent(async () => import("./businessPanel/security/right.vue")),
  SecurityMonitorBuildLeft: defineAsyncComponent(async () => import("./businessPanel/security/build-left.vue")),
  SecurityMonitorBuildRight: defineAsyncComponent(async () => import("./businessPanel/security/build-right.vue")),
  /**
   * @说明 电气安全业务面板
   */
  ElectricalLeft: defineAsyncComponent(async () => import("./businessPanel/electrical/electrical-left.vue")),
  ElectricalRight: defineAsyncComponent(async () => import("./businessPanel/electrical/electrical-right.vue")),
  ElectricalBuildRight: defineAsyncComponent(async () => import("./businessPanel/electrical/electrical-build-right.vue")),
  ElectricalFloorRight: defineAsyncComponent(async () => import("./businessPanel/electrical/electrical-floor-right.vue")),
  /**
   * @说明 消防管理业务面板
   */
  FireControlLeft: defineAsyncComponent(async () => import("./businessPanel/fire-control/fire-left.vue")),
  FireControlRight: defineAsyncComponent(async () => import("./businessPanel/fire-control/fire-right.vue")),
  FireControlFloorRight: defineAsyncComponent(async () => import("./businessPanel/fire-control/fire-floor-right.vue")),
  /**
   * @说明 动环监控
   */
  EnvironmentalMonitorLeft: defineAsyncComponent(async () => import("./businessPanel/environmental-monitor/left.vue")),
  EnvironmentalMonitorRight: defineAsyncComponent(async () => import("./businessPanel/environmental-monitor/right.vue")),
  EnvironmentalMonitorFloorRight: defineAsyncComponent(async () => import("./businessPanel/environmental-monitor/floor-right.vue")),
  /**
   * @说明 门禁管理
   */
  accessControlLeft: defineAsyncComponent(async () => import("./businessPanel/access-control/access-left.vue")),
  accessControlRight: defineAsyncComponent(async () => import("./businessPanel/access-control/access-right.vue")),
  demoAccessControlRight: defineAsyncComponent(async () => import("./businessPanel/demo-panel/access-right.vue")),
  demoAccessControlLeft: defineAsyncComponent(async () => import("./businessPanel/demo-panel/access-left.vue")),
  /**
   * @说明 空调管理
   */
  airConditioningLfet: defineAsyncComponent(async () => import("./businessPanel/air-conditioning/air-conditioning-left.vue")),
  airConditioningRight: defineAsyncComponent(async () => import("./businessPanel/air-conditioning/air-conditioning-right.vue")),
  /**
   * @说明 给排水
   */
  drainOffWaterLfet: defineAsyncComponent(async () => import("./businessPanel/drain-off-water/left.vue")),
  drainOffWaterRight: defineAsyncComponent(async () => import("./businessPanel/drain-off-water/right.vue")),
  /**
   * @说明 送排风
   */
  airExhaustLeft: defineAsyncComponent(async () => import("./businessPanel/air-exhaust/air-exhaust-left.vue")),
  airExhaustRight: defineAsyncComponent(async () => import("./businessPanel/air-exhaust/air-exhaust-right.vue")),
  /**
   * @说明 入侵报警
   */
  IntrusionAlarmLfet: defineAsyncComponent(async () => import("./businessPanel/drain-off-water/left.vue")),
  IntrusionAlarmRight: defineAsyncComponent(async () => import("./businessPanel/drain-off-water/right.vue")),
  /**
   * @说明 停车管理
   */
  stopManageLeft: defineAsyncComponent(async () => import("./businessPanel/stop-manage/stop-manage-left.vue")),
  stopManageRight: defineAsyncComponent(async () => import("./businessPanel/stop-manage/stop-manage-right.vue")),
  demoStopManageLeft: defineAsyncComponent(async () => import("./businessPanel/demo-panel/stop-manage-left.vue")),
  demoStopManageRight: defineAsyncComponent(async () => import("./businessPanel/demo-panel/stop-manage-right.vue")),
  stopManageBuildLeft: defineAsyncComponent(async () => import("./businessPanel/stop-manage/stop-manage-left1.vue")),
  stopManageBuildRight: defineAsyncComponent(async () => import("./businessPanel/stop-manage/stop-manage-right1.vue")),
  /**
   * @说明 照明管理
   */
  lightingLeft: defineAsyncComponent(async () => import("./businessPanel/lighting/lighting-left.vue")),
  lightingRight: defineAsyncComponent(async () => import("./businessPanel/lighting/lighting-right.vue")),
  /**
   * 保供
   */
  SupplyGuaranteeLeft: defineAsyncComponent(async () => import("./businessPanel/supply-guarantee/left.vue")),
  SupplyGuaranteeRight: defineAsyncComponent(async () => import("./businessPanel/supply-guarantee/right.vue")),
  /**
   * 星配送
   */
  DeliveryLeft: defineAsyncComponent(async () => import("./businessPanel/delivery/left.vue")),
  DeliveryRight: defineAsyncComponent(async () => import("./businessPanel/delivery/right.vue")),

  /**
   * 手术示教
   */
  DemonstrationParkLeft: defineAsyncComponent(async () => import("./businessPanel/surgical-demonstration/park-left.vue")),
  DemonstrationParkRight: defineAsyncComponent(async () => import("./businessPanel/surgical-demonstration/park-right.vue")),
  DemonstrationBuildingLeft: defineAsyncComponent(async () => import("./businessPanel/surgical-demonstration/building-left.vue")),
  DemonstrationBuildingRight: defineAsyncComponent(async () => import("./businessPanel/surgical-demonstration/building-right.vue")),
  DemonstrationFloorLeft: defineAsyncComponent(async () => import("./businessPanel/surgical-demonstration/floor-left.vue")),
  DemonstrationFloorRight: defineAsyncComponent(async () => import("./businessPanel/surgical-demonstration/floor-right.vue")),
  /**
   * 电梯监控
   */
  ElevatorMonitoringParkLeft: defineAsyncComponent(async () => import("./businessPanel/elevator-monitoring/park-left.vue")),
  ElevatorMonitoringParkRight: defineAsyncComponent(async () => import("./businessPanel/elevator-monitoring/park-right.vue")),
  ElevatorMonitoringBuildingLeft: defineAsyncComponent(async () => import("./businessPanel/elevator-monitoring/building-left.vue")),
  ElevatorMonitoringBuildingRight: defineAsyncComponent(async () => import("./businessPanel/elevator-monitoring/building-right.vue")),
  /**
   * 院区
   */
  HospitalHomePageLeft: defineAsyncComponent(async () => import("./businessPanel/hospital/home-page-left.vue")),
  HospitalHomePageRight: defineAsyncComponent(async () => import("./businessPanel/hospital/home-page-right.vue")),
  /**
   * 运维态势
   */
  OperationLeft: defineAsyncComponent(async () => import("./businessPanel/operation/left.vue")),
  OperationRight: defineAsyncComponent(async () => import("./businessPanel/operation/right.vue")),
  /**
   * @说明 安全态势业务面板
   */
  SecuritySituationLeft: defineAsyncComponent(async () => import("./businessPanel/security-situationNew/left.vue")),
  SecuritySituationRight: defineAsyncComponent(async () => import("./businessPanel/security-situationNew/right.vue")),
  /**
   * 运营态势
   */
  OperationManagementLeft: defineAsyncComponent(async () => import("./businessPanel/operation-management/left.vue")),
  OperationManagementRight: defineAsyncComponent(async () => import("./businessPanel/operation-management/right.vue")),
  /**
   * 能耗态势
   */
  EnergyConsumptionLeft: defineAsyncComponent(async () => import("./businessPanel/energy-consumption/leftNew.vue")),
  EnergyConsumptionRight: defineAsyncComponent(async () => import("./businessPanel/energy-consumption/rightNew.vue")),
  EnergyConsumptionFloorLeft: defineAsyncComponent(async () => import("./businessPanel/energy-consumption/floor-left.vue")),
  EnergyConsumptionFloorRight: defineAsyncComponent(async () => import("./businessPanel/energy-consumption/floor-right.vue")),
  /**
   * 信息发布
   */
  InformationReleaseLeft: defineAsyncComponent(async () => import("./businessPanel/Information-release/left.vue")),
  InformationReleaseRight: defineAsyncComponent(async () => import("./businessPanel/Information-release/right.vue")),
  /**
   * 泸州医院总览
   */
  LuzhouOverviewLeft: defineAsyncComponent(async () => import("./businessPanel/luzhouOverview/left.vue")),
  LuzhouOverviewRight: defineAsyncComponent(async () => import("./businessPanel/luzhouOverview/right.vue")),
  /**
   * 光明滑轨-肉类交易
   */
  WholesaleOverviewLeft: defineAsyncComponent(async () => import("./businessPanel/meat-trading/left.vue")),
  WholesaleOverviewRight: defineAsyncComponent(async () => import("./businessPanel/meat-trading/right.vue")),
  MeatTradingLeft: defineAsyncComponent(async () => import("./businessPanel/meat-trading/build-left.vue")),
  MeatTradingRight: defineAsyncComponent(async () => import("./businessPanel/meat-trading/build-right.vue")),
  MeatTradingBuildLeft: defineAsyncComponent(async () => import("./businessPanel/meat-trading/floor-left.vue")),
  MeatTradingBuildRight: defineAsyncComponent(async () => import("./businessPanel/meat-trading/floor-right.vue")),
  TianJinMeatTradingLeft: defineAsyncComponent(async () => import("./businessPanel/meat-trading/tianjin-build-left.vue")),
  TianJinMeatTradingRight: defineAsyncComponent(async () => import("./businessPanel/meat-trading/tianjin-build-right.vue")),
  TianJinMeatTradingBuildLeft: defineAsyncComponent(async () => import("./businessPanel/meat-trading/tianjin-floor-left.vue")),
  TianJinMeatTradingBuildRight: defineAsyncComponent(async () => import("./businessPanel/meat-trading/tianjin-floor-right.vue")),
  /**
   * 资产运营
   */
  AssetOperationLeft: defineAsyncComponent(async () => import("./businessPanel/demo-panel/assetOperationLeft.vue")),
  AssetOperationRight: defineAsyncComponent(async () => import("./businessPanel/demo-panel/assetOperationRight.vue")),
  /**
   * 福州儿童医院
   */
  ChildrenHospitalLeft: defineAsyncComponent(async () => import("./businessPanel/children-hospital/left.vue")),
  ChildrenHospitalRight: defineAsyncComponent(async () => import("./businessPanel/children-hospital/right.vue")),
  /**
   * 中亿丰
   * 客流分析
   * 冷热源
   * 广播中心
   */
  PassengerFlowLeft: defineAsyncComponent(async () => import("./businessPanel/passenger-flow/left.vue")),
  PassengerFlowRight: defineAsyncComponent(async () => import("./businessPanel/passenger-flow/right.vue")),
  ColdHeatSourcesLeft: defineAsyncComponent(async () => import("./businessPanel/cold-heat-sources/left.vue")),
  ColdHeatSourcesRight: defineAsyncComponent(async () => import("./businessPanel/cold-heat-sources/right.vue")),
  BroadcastLeft: defineAsyncComponent(async () => import("./businessPanel/broadcast/left.vue")),
  BroadcastRight: defineAsyncComponent(async () => import("./businessPanel/broadcast/right.vue")),

  /**
   * 上海二期 商户管理
   */
  MerchantManageLeft: defineAsyncComponent(async () => import("./businessPanel/merchant-manage/left.vue")),
  MerchantManageRight: defineAsyncComponent(async () => import("./businessPanel/merchant-manage/right.vue")),
  OverviewLeft: defineAsyncComponent(async () => import("./businessPanel/merchant-manage/overviewLeft.vue")),
  OverviewRight: defineAsyncComponent(async () => import("./businessPanel/merchant-manage/overviewRight.vue")),

  /**
   * 南沙国际 电子巡更  电子巡更（海康）
   */
  ElectronicPatrolLeft: defineAsyncComponent(async () => import("./businessPanel/electronicPatrol/left.vue")),
  ElectronicPatrolRight: defineAsyncComponent(async () => import("./businessPanel/electronicPatrol/right.vue")),
  ElectronicPatrolLeftHK: defineAsyncComponent(async () => import("./businessPanel/electronicPatrol/left_hk.vue")),
  ElectronicPatrolRightHK: defineAsyncComponent(async () => import("./businessPanel/electronicPatrol/right_hk.vue")),

  /**
   * 周界防护
   */
  PerimeterLeft: defineAsyncComponent(async () => import("./businessPanel/perimeter/left.vue")),
  PerimeterRight: defineAsyncComponent(async () => import("./businessPanel/perimeter/right.vue")),

  /**
   * 医用气体 新
   */
  MedicalGasNewLeft: defineAsyncComponent(async () => import("./businessPanel/medical-gas-new/left.vue")),
  MedicalGasNewRight: defineAsyncComponent(async () => import("./businessPanel/medical-gas-new/right.vue")),
  MedicalGasNewBuildLeft: defineAsyncComponent(async () => import("./businessPanel/medical-gas-new/build-left.vue")),
  MedicalGasNewBuildRight: defineAsyncComponent(async () => import("./businessPanel/medical-gas-new/build-right.vue")),

  /**
   * 锅炉系统
   */
  BoilerLeft: defineAsyncComponent(async () => import("./businessPanel/boiler/left.vue")),
  BoilerRight: defineAsyncComponent(async () => import("./businessPanel/boiler/right.vue")),

  /**
   *  @说明 污水处理
   */
  SewageDisposalLfet: defineAsyncComponent(async () => import("./businessPanel/sewage-disposal/left.vue")),
  SewageDisposalRight: defineAsyncComponent(async () => import("./businessPanel/sewage-disposal/right.vue")),

  /**
   *  @说明 净化系统
   */
  purificationSystemLfet: defineAsyncComponent(async () => import("./businessPanel/purification-system/left.vue")),
  purificationSystemRight: defineAsyncComponent(async () => import("./businessPanel/purification-system/right.vue")),

  /**
   *  @说明 空气源
   */
  airSourceLfet: defineAsyncComponent(async () => import("./businessPanel/purification-system/left.vue")),
  airSourceRight: defineAsyncComponent(async () => import("./businessPanel/purification-system/right.vue")),

  /**
   *  @说明 净水系统
   */
  waterPurificationLeft: defineAsyncComponent(async () => import("./businessPanel/water-purification/left.vue")),
  waterPurificationRight: defineAsyncComponent(async () => import("./businessPanel/water-purification/right.vue")),
  demoWaterPurificationLeft: defineAsyncComponent(async () => import("./businessPanel/demo-panel/purification-system-left.vue")),

  /**
   *  @说明 物流系统
   */
  logisticsLeft: defineAsyncComponent(async () => import("./businessPanel/logistics/left.vue")),
  logisticsRight: defineAsyncComponent(async () => import("./businessPanel/logistics/right.vue")),

  /**
   *  @说明 计算机网络
   */
  computerNetworkLeft: defineAsyncComponent(async () => import("./businessPanel/computer-network/left.vue")),
  computerNetworkRight: defineAsyncComponent(async () => import("./businessPanel/computer-network/right.vue")),

  /**
   *  @说明 无线通讯
   */
  telecommunicationsLeft: defineAsyncComponent(async () => import("./businessPanel/telecommunications/left.vue")),
  telecommunicationsRight: defineAsyncComponent(async () => import("./businessPanel/computer-network/right.vue")),

  /**
   *  @说明 电梯管理
   */
  liftLeft: defineAsyncComponent(async () => import("./businessPanel/lift-manage/left.vue")),
  liftRight: defineAsyncComponent(async () => import("./businessPanel/lift-manage/right.vue")),

  /**
   *  @说明 新风管理
   */
  freshAirLeft: defineAsyncComponent(async () => import("./businessPanel/fresh-air-manage/left.vue")),
  freshAirRight: defineAsyncComponent(async () => import("./businessPanel/fresh-air-manage/right.vue")),

  /**
   *  @说明 安检通道
   */
  securityCheckLeft: defineAsyncComponent(async () => import("./businessPanel/security-check/left.vue")),
  securityCheckRight: defineAsyncComponent(async () => import("./businessPanel/security-check/right.vue")),

  /**
   *  @说明 楼层设备面板
   */
  floorEquipment: defineAsyncComponent(async () => import("./businessPanel/floorEquipment/right.vue")),
  floorEquipmentLeft: defineAsyncComponent(async () => import("./businessPanel/floorEquipment/left.vue")),
  /**
   *  @说明 漫游设备面板
   */
  RoamingDevices: defineAsyncComponent(async () => import("./businessPanel/roamingDevices/right.vue")),

  /**
   *  @说明 视频监控面板-鹏程小学定制
   */
  VideoMonitoring: defineAsyncComponent(async () => import("./businessPanel/videoMonitoring/right.vue")),

  /***
   * 医用冷冻冷藏
   *
   */
  FreezeLeft: defineAsyncComponent(async () => import("./businessPanel/freeze/left.vue")),
  FreezeRight: defineAsyncComponent(async () => import("./businessPanel/freeze/right.vue")),
  /***
   * 手术示教1.0
   *
   */
  DemonstrationNewLeft: defineAsyncComponent(async () => import("./businessPanel/surgical-demonstration-new/left.vue")),
  DemonstrationNewRight: defineAsyncComponent(async () => import("./businessPanel/surgical-demonstration-new/right.vue")),
  /***
   * 园林系统
   *
   */
  GardensLeft: defineAsyncComponent(async () => import("./businessPanel/gardens/left.vue")),
  GardensRight: defineAsyncComponent(async () => import("./businessPanel/gardens/right.vue")),
  /**
   *  @说明 洁净空调
   */
  CleanConditioningLeft: defineAsyncComponent(async () => import("./businessPanel/telecommunications/left.vue")),
  CleanConditioningRight: defineAsyncComponent(async () => import("./businessPanel/computer-network/right.vue")),
  /**
   *  @说明 园区管理
   */
  ParkManagementLeft: defineAsyncComponent(async () => import("./businessPanel/park-management/left.vue")),
  ParkManagementRight: defineAsyncComponent(async () => import("./businessPanel/park-management/right.vue")),
  /**
   *  @说明 会议管理
   */
  MeetingsLeft: defineAsyncComponent(async () => import("./businessPanel/management-meetings/left.vue")),
  MeetingsRight: defineAsyncComponent(async () => import("./businessPanel/management-meetings/right.vue")),
  /**
   *  @说明 紧急电话
   */
  EmergencyPhoneLeft: defineAsyncComponent(async () => import("./businessPanel/emergency-phone/left.vue")),
  EmergencyPhoneRight: defineAsyncComponent(async () => import("./businessPanel/emergency-phone/right.vue")),
  /**
   *  @说明 交通灯
   */
  TrafficLightLeft: defineAsyncComponent(async () => import("./businessPanel/traffic-light/left.vue")),
  TrafficLightRight: defineAsyncComponent(async () => import("./businessPanel/traffic-light/right.vue")),
  /**
   *  @说明 车流量
   */
  TrafficColumeLeft: defineAsyncComponent(async () => import("./businessPanel/traffic-volume/left.vue")),
  TrafficColumeRight: defineAsyncComponent(async () => import("./businessPanel/traffic-volume/right.vue")),
  /**
   *  @说明 交通控制
   */
  TrafficControlLeft: defineAsyncComponent(async () => import("./businessPanel/trafficControl/left.vue")),
  TrafficControlRight: defineAsyncComponent(async () => import("./businessPanel/traffic-light/right.vue")),
  /**
   * @说明 消防管理业务面板 2.0
   */
  FireControlNewLeft: defineAsyncComponent(async () => import("./businessPanel/fire-controlNew/fire-left.vue")),
  FireControlNewRight: defineAsyncComponent(async () => import("./businessPanel/fire-controlNew/fire-right.vue")),
  /**
   * @说明 电气安全业务面板2.0
   */
  ElectricalNewLeft: defineAsyncComponent(async () => import("./businessPanel/electrical-new/electrical-left.vue")),
  ElectricalNewRight: defineAsyncComponent(async () => import("./businessPanel/electrical-new/electrical-right.vue")),
  /**
   * @说明 动环监控2.0
   */
  EnvironmentalMonitorNewLeft: defineAsyncComponent(async () => import("./businessPanel/environmental-new-monitor/left.vue")),
  EnvironmentalMonitorNewRight: defineAsyncComponent(async () => import("./businessPanel/environmental-new-monitor/right.vue")),
  /**
   * @说明 用气管理2.0
   */
  GasManagementLeft: defineAsyncComponent(async () => import("./businessPanel/gas-management/left.vue")),
  GasManagementRight: defineAsyncComponent(async () => import("./businessPanel/gas-management/right.vue")),
  /**
   * @说明 安全管理2.0
   */
  SafetyManagementLeft: defineAsyncComponent(async () => import("./businessPanel/safety-management/left.vue")),
  SafetyManagementRight: defineAsyncComponent(async () => import("./businessPanel/safety-management/right.vue")),
  /**
   *  电子巡更2.0
   */
  ElectronicPatrolNewLeft: defineAsyncComponent(async () => import("./businessPanel/electronicPatrol-new/left.vue")),
  ElectronicPatrolNewRight: defineAsyncComponent(async () => import("./businessPanel/electronicPatrol-new/right.vue")),
  /**
   *  指挥调度2.0
   */
  CommandDispatchNewLeft: defineAsyncComponent(async () => import("./businessPanel/command-dispatchNew/left.vue")),
  CommandDispatchNewRight: defineAsyncComponent(async () => import("./businessPanel/command-dispatchNew/right.vue")),
  /**
   *  应急资源
   */
  EmergencyResourcesLeft: defineAsyncComponent(async () => import("./businessPanel/emergency-resources/left.vue")),
  EmergencyResourcesRight: defineAsyncComponent(async () => import("./businessPanel/emergency-resources/right.vue")),
  /**
   *  智能卡
   */
  SmartCardLeft: defineAsyncComponent(async () => import("./businessPanel/smart-card/left.vue")),
  SmartCardRight: defineAsyncComponent(async () => import("./businessPanel/smart-card/right.vue")),
  /**
   *  环境监测
   */
  EnvironmentalMonitoringLeft: defineAsyncComponent(async () => import("./businessPanel/environmental-monitoring/left.vue")),
  EnvironmentalMonitoringRight: defineAsyncComponent(async () => import("./businessPanel/environmental-monitoring/right.vue")),
  /**
   *  消费管理
   */
  ConsumptionLeft: defineAsyncComponent(async () => import("./businessPanel/consumption/left.vue")),
  ConsumptionRight: defineAsyncComponent(async () => import("./businessPanel/consumption/right.vue")),
  /**
   *  预付费
   */
  PrepaidLeft: defineAsyncComponent(async () => import("./businessPanel/Prepaid/left.vue")),
  PrepaidRight: defineAsyncComponent(async () => import("./businessPanel/Prepaid/right.vue")),
  /**
   *  @说明 能耗通用面板
   */
  EnergyPanel: defineAsyncComponent(async () => import("./businessPanel/energy-consumption/energy-panel.vue")),
  EquipmentPanelDispatch: defineAsyncComponent(async () => import("./equipmentPanel/businessPanel/dispatch.vue")),
  /**
   * 彭州
   */

  // 彭州中医药资产运营 done
  PengZhouOverviewLeft: defineAsyncComponent(async () => import("./businessPanel/pz-demo/overview/pengZhouOverviewLeft.vue")),
  PengZhouOverviewRight: defineAsyncComponent(async () => import("./businessPanel/pz-demo/overview/pengZhouOverviewRight.vue")),
  // 空间资产3D done
  PengSpaceAssets3DLeft: defineAsyncComponent(
    async () => import("./businessPanel/pz-demo/space-assets/space-assets-3d/space-assets-3d-left.vue"),
  ),
  PengSpaceAssets3DRight: defineAsyncComponent(
    async () => import("./businessPanel/pz-demo/space-assets/space-assets-3d/space-assets-3d-right.vue"),
  ),
  // 空间资产总览 done
  PengSpaceAssetsOverviewLeft: defineAsyncComponent(
    async () => import("./businessPanel/pz-demo/space-assets/space-assets-overview/space-assets-overview-left.vue"),
  ),
  PengSpaceAssetsOverviewRight: defineAsyncComponent(
    async () => import("./businessPanel/pz-demo/space-assets/space-assets-overview/space-assets-overview-right.vue"),
  ),
  // 租赁分析 done
  PengLeaseAnalysisLeft: defineAsyncComponent(async () => import("./businessPanel/pz-demo/lease-analysis/lease-analysis-left.vue")),
  PengLeaseAnalysisRight: defineAsyncComponent(async () => import("./businessPanel/pz-demo/lease-analysis/lease-analysis-right.vue")),
  // 销售分析 done
  PengSalesAnalysisLeft: defineAsyncComponent(async () => import("./businessPanel/pz-demo/sales-analysis/sales-analysis-left.vue")),
  PengSalesAnalysisRight: defineAsyncComponent(async () => import("./businessPanel/pz-demo/sales-analysis/sales-analysis-right.vue")),
  // 客流分析 done
  PengPassengerFlowAnalysisLeft: defineAsyncComponent(
    async () => import("./businessPanel/pz-demo/passenger-flow-analysis/passenger-flow-analysis-left.vue"),
  ),
  PengPassengerFlowAnalysisRight: defineAsyncComponent(
    async () => import("./businessPanel/pz-demo/passenger-flow-analysis/passenger-flow-analysis-right.vue"),
  ),
  // 安防视频 done
  PengSecurityVideoLeft: defineAsyncComponent(async () => import("./businessPanel/pz-demo/security-video/security-video-left.vue")),
  PengSecurityVideoRight: defineAsyncComponent(async () => import("./businessPanel/pz-demo/security-video/security-video-right.vue")),
  // 态势感知 done
  PengSituationAwarenessLeft: defineAsyncComponent(
    async () => import("./businessPanel/pz-demo/situation-awareness/situation-awareness-left.vue"),
  ),
  PengSituationAwarenessRight: defineAsyncComponent(
    async () => import("./businessPanel/pz-demo/situation-awareness/situation-awareness-right.vue"),
  ),
  // 彭州实验室 done
  SYSLeft: defineAsyncComponent(async () => import("./businessPanel/pz-demo/other/SYSLeft.vue")),
  SYSRight: defineAsyncComponent(async () => import("./businessPanel/pz-demo/other/SYSRight.vue")),
  // 公共服务 done
  GGFWLeft: defineAsyncComponent(async () => import("./businessPanel/pz-demo/other/GGFWLeft.vue")),
  GGFWRight: defineAsyncComponent(async () => import("./businessPanel/pz-demo/other/GGFWRight.vue")),
  // 校园服务 done
  XYFWLeft: defineAsyncComponent(async () => import("./businessPanel/pz-demo/other/XYFWLeft.vue")),
  XYFWRight: defineAsyncComponent(async () => import("./businessPanel/pz-demo/other/XYFWRight.vue")),
  // 停车服务 done
  TCFWLeft: defineAsyncComponent(async () => import("./businessPanel/pz-demo/other/TCFWLeft.vue")),
  TCFWRight: defineAsyncComponent(async () => import("./businessPanel/pz-demo/other/TCFWRight.vue")),
  // 物业服务 done
  WYFWLeft: defineAsyncComponent(async () => import("./businessPanel/pz-demo/other/WYFWLeft.vue")),
  WYFWRight: defineAsyncComponent(async () => import("./businessPanel/pz-demo/other/WYFWRight.vue")),
  // 园区安全 done
  YQAQLeft: defineAsyncComponent(async () => import("./businessPanel/pz-demo/other/YQAQLeft.vue")),
  YQAQRight: defineAsyncComponent(async () => import("./businessPanel/pz-demo/other/YQAQRight.vue")),
  // 招商运营
  ZSYYLeft: defineAsyncComponent(async () => import("./businessPanel/pz-demo/other/ZSYYLeft.vue")),
  ZSYYRight: defineAsyncComponent(async () => import("./businessPanel/pz-demo/other/ZSYYRight.vue")),
  // 设备设施
  SBSSLeft: defineAsyncComponent(async () => import("./businessPanel/pz-demo/other/SBSSLeft.vue")),
  SBSSRight: defineAsyncComponent(async () => import("./businessPanel/pz-demo/other/SBSSRight.vue")),
  // 能耗监测
  NHJCLeft: defineAsyncComponent(async () => import("./businessPanel/pz-demo/other/NHJCLeft.vue")),
  NHJCRight: defineAsyncComponent(async () => import("./businessPanel/pz-demo/other/NHJCRight.vue")),
};
/**
 * @说明 设备面板批量导入
 */
export const DevicePanel: Record<string, Component> = {
  MonitorPanel: defineAsyncComponent(async () => import("./equipmentPanel/monitorPanel.vue")),
  AlarmPanel: defineAsyncComponent(async () => import("./equipmentPanel/alarmPanel.vue")),
  EquipmentPanelDispatch: defineAsyncComponent(async () => import("./equipmentPanel/businessPanel/dispatch.vue")),
  EquipmentPanelEalectrical: defineAsyncComponent(async () => import("./equipmentPanel/businessPanel/electrical.vue")),
  EquipmentPanelSecurity: defineAsyncComponent(async () => import("./equipmentPanel/businessPanel/security.vue")),
  EquipmentCommonPanel: defineAsyncComponent(async () => import("./equipmentPanel/equipment-common-panel.vue")),
  EquipmentAbbreviationsPanel: defineAsyncComponent(async () => import("./businessPanel/floorEquipment/device-details-pop.vue")), // 设备缩略弹窗
  EquipmentDetailPanel: defineAsyncComponent(async () => import("./equipmentdetails/index.vue")), // 设备详情弹窗
  StallDetailPanel: defineAsyncComponent(async () => import("./equipmentdetails/stall-model/stall-model.vue")), // 档位详情弹窗
  PropertyDetailPanel: defineAsyncComponent(async () => import("./equipmentdetails/property-model/property-model.vue")), // 资产详情弹窗
  RiskDetailPanel: defineAsyncComponent(async () => import("./equipmentdetails/risk-model/risk-model.vue")), // 风险源详情弹窗
  GearDetailPanel: defineAsyncComponent(async () => import("./gearposition/index.vue")),
  TallyingModal: defineAsyncComponent(async () => import("./equipmentPanel/tallying-modal/tallying-modal.vue")), //理货机 弹窗
  gearDetailsModel: defineAsyncComponent(async () => import("./businessPanel/merchant-manage/components/gear-details-model.vue")), //理货机 弹窗
};
/**
 * @说明 报警弹窗、面板
 */
export const AlarmPanel: Record<string, Component> = {
  AlarmListPanel: defineAsyncComponent(
    async () =>
      (await import("../pages/widget/title-bar/components/alarm-entry/components/alarm-list-panel/alarm-list-panel")).AlarmListPanel,
  ), //报警列表 右侧面板
  AlarmDetailPanel: defineAsyncComponent(async () => import("./alarmdetails/equipmentMode.vue")), //报警详情 弹窗
};
