import { App, Component, defineAsyncComponent } from "vue";
/**
 * @说明 业务面板批量导入
 */
export const BusinessPanel: Record<string, Component> = {
  /**
   * @说明 粮仓(展会)
   */
  GranaryLeft: defineAsyncComponent(async () => import("@/features/cards/granary/granary-left")),
  GranaryRight: defineAsyncComponent(async () => import("@/features/cards/granary/granary-right")),
  /**
   * @说明 分诊排号业务面板（展会）
   */
  TriageQueueLeft: defineAsyncComponent(async () => import("@/features/cards/triage-queue/left")),
  TriageQueueRight: defineAsyncComponent(async () => import("@/features/cards/triage-queue/right")),
  TriageQueueFloorLeft: defineAsyncComponent(async () => import("@/features/cards/triage-queue/floor-left")),
  TriageQueueFloorRight: defineAsyncComponent(async () => import("@/features/cards/triage-queue/floor-right")),

  /**
   * @说明 医护对讲业务面板 (展会)
   */
  MedicalIntercomLeft: defineAsyncComponent(async () => import("@/features/cards/medical-intercom/left")),
  MedicalIntercomRight: defineAsyncComponent(async () => import("@/features/cards/medical-intercom/right")),
  MedicalIntercomBuildLeft: defineAsyncComponent(async () => import("@/features/cards/medical-intercom/build-left")),
  MedicalIntercomBuildRight: defineAsyncComponent(async () => import("@/features/cards/medical-intercom/build-right")),
  MedicalIntercomFloorLeft: defineAsyncComponent(async () => import("@/features/cards/medical-intercom/floor-left")),
  MedicalIntercomFloorRight: defineAsyncComponent(async () => import("@/features/cards/medical-intercom/floor-right")),

  /**
   * @说明 指挥调度业务面板
   */
  CommandDispatchLeft: defineAsyncComponent(async () => import("@/features/cards/command-dispatch/left")),
  CommandDispatchRight: defineAsyncComponent(async () => import("@/features/cards/command-dispatch/right")),
  CommandDispatchBuildLeft: defineAsyncComponent(async () => import("@/features/cards/command-dispatch/build-left")),
  CommandDispatchBuildRight: defineAsyncComponent(async () => import("@/features/cards/command-dispatch/build-right")),
  // CommandDispatchFloorRight:defineAsyncComponent(async () =>import('@/features/cards/commandDispatch/floorRight')),
  /**
   * @说明 安防监控业务面板
   */
  SecurityMonitorLeft: defineAsyncComponent(async () => import("@/features/cards/security/left")),
  SecurityMonitorRight: defineAsyncComponent(async () => import("@/features/cards/security/right")),
  SecurityMonitorBuildLeft: defineAsyncComponent(async () => import("@/features/cards/security/build-left")),
  SecurityMonitorBuildRight: defineAsyncComponent(async () => import("@/features/cards/security/build-right")),
  /**
   * @说明 电气安全业务面板
   */
  ElectricalLeft: defineAsyncComponent(async () => import("@/features/cards/electrical/electrical-left")),
  ElectricalRight: defineAsyncComponent(async () => import("@/features/cards/electrical/electrical-right")),
  ElectricalBuildRight: defineAsyncComponent(async () => import("@/features/cards/electrical/electrical-build-right")),
  ElectricalFloorRight: defineAsyncComponent(async () => import("@/features/cards/electrical/electrical-floor-right")),
  /**
   * @说明 消防管理业务面板
   */
  FireControlLeft: defineAsyncComponent(async () => import("@/features/cards/fire-control/fire-left")),
  FireControlRight: defineAsyncComponent(async () => import("@/features/cards/fire-control/fire-right")),
  /**
   * @说明 动环监控
   */
  EnvironmentalMonitorLeft: defineAsyncComponent(async () => import("@/features/cards/environmental-monitor/left")),
  EnvironmentalMonitorRight: defineAsyncComponent(async () => import("@/features/cards/environmental-monitor/right")),
  EnvironmentalMonitorFloorRight: defineAsyncComponent(async () => import("@/features/cards/environmental-monitor/floor-right")),
  /**
   * @说明 门禁管理
   */
  accessControlLeft: defineAsyncComponent(async () => import("@/features/cards/access-control/access-left")),
  accessControlRight: defineAsyncComponent(async () => import("@/features/cards/access-control/access-right")),
  /**
   * @说明 空调管理
   */
  airConditioningLfet: defineAsyncComponent(async () => import("@/features/cards/air-conditioning/air-conditioning-left")),
  airConditioningRight: defineAsyncComponent(async () => import("@/features/cards/air-conditioning/air-conditioning-right")),
  /**
   * @说明 给排水
   */
  drainOffWaterLfet: defineAsyncComponent(async () => import("@/features/cards/drain-off-water/left")),
  drainOffWaterRight: defineAsyncComponent(async () => import("@/features/cards/drain-off-water/right")),
  /**
   * @说明 送排风
   */
  airExhaustLeft: defineAsyncComponent(async () => import("@/features/cards/air-exhaust/air-exhaust-left")),
  airExhaustRight: defineAsyncComponent(async () => import("@/features/cards/air-exhaust/air-exhaust-right")),
  /**
   * @说明 入侵报警
   */
  IntrusionAlarmLfet: defineAsyncComponent(async () => import("@/features/cards/drain-off-water/left")),
  IntrusionAlarmRight: defineAsyncComponent(async () => import("@/features/cards/drain-off-water/right")),
  /**
   * @说明 停车管理
   */
  stopManageLeft: defineAsyncComponent(async () => import("@/features/cards/stop-manage/stop-manage-left")),
  stopManageRight: defineAsyncComponent(async () => import("@/features/cards/stop-manage/stop-manage-right")),
  stopManageBuildLeft: defineAsyncComponent(async () => import("@/features/cards/stop-manage/stop-manage-left1")),
  stopManageBuildRight: defineAsyncComponent(async () => import("@/features/cards/stop-manage/stop-manage-right1")),
  /**
   * @说明 照明管理
   */
  lightingLeft: defineAsyncComponent(async () => import("@/features/cards/lighting/lighting-left")),
  lightingRight: defineAsyncComponent(async () => import("@/features/cards/lighting/lighting-right")),
  /**
   * 保供
   */
  SupplyGuaranteeLeft: defineAsyncComponent(async () => import("@/features/cards/supply-guarantee/left")),
  SupplyGuaranteeRight: defineAsyncComponent(async () => import("@/features/cards/supply-guarantee/right")),
  /**
   * 星配送
   */
  DeliveryLeft: defineAsyncComponent(async () => import("@/features/cards/delivery/left")),
  DeliveryRight: defineAsyncComponent(async () => import("@/features/cards/delivery/right")),

  /**
   * 院区
   */
  HospitalHomePageRight: defineAsyncComponent(async () => import("@/features/cards/hospital/home-page-right")),
  /**
   * 运维态势
   */
  OperationLeft: defineAsyncComponent(async () => import("@/features/cards/operation/left")),
  OperationRight: defineAsyncComponent(async () => import("@/features/cards/operation/right")),
  /**
   * @说明 安全态势业务面板
   */
  SecuritySituationLeft: defineAsyncComponent(async () => import("@/features/cards/security-situationNew/left")),
  SecuritySituationRight: defineAsyncComponent(async () => import("@/features/cards/security-situationNew/right")),
  /**
   * 能耗态势
   */
  EnergyConsumptionLeft: defineAsyncComponent(async () => import("@/features/cards/energy-consumption/leftNewV2")),
  EnergyConsumptionRight: defineAsyncComponent(async () => import("@/features/cards/energy-consumption/rightNewV2")),
  EnergyConsumptionFloorLeft: defineAsyncComponent(async () => import("@/features/cards/energy-consumption/floor-left")),
  EnergyConsumptionFloorRight: defineAsyncComponent(async () => import("@/features/cards/energy-consumption/floor-right")),
  /**
   * 信息发布
   */
  InformationReleaseLeft: defineAsyncComponent(async () => import("@/features/cards/Information-release/left")),
  InformationReleaseRight: defineAsyncComponent(async () => import("@/features/cards/Information-release/right")),
  /**
   * 泸州医院总览
   */
  LuzhouOverviewLeft: defineAsyncComponent(async () => import("@/features/cards/luzhouOverview/left")),
  LuzhouOverviewRight: defineAsyncComponent(async () => import("@/features/cards/luzhouOverview/right")),
  /**
   * 光明滑轨-肉类交易
   */
  WholesaleOverviewLeft: defineAsyncComponent(async () => import("@/features/cards/meat-trading/left")),
  WholesaleOverviewRight: defineAsyncComponent(async () => import("@/features/cards/meat-trading/right")),
  MeatTradingLeft: defineAsyncComponent(async () => import("@/features/cards/meat-trading/build-left")),
  MeatTradingRight: defineAsyncComponent(async () => import("@/features/cards/meat-trading/build-right")),
  MeatTradingBuildLeft: defineAsyncComponent(async () => import("@/features/cards/meat-trading/floor-left")),
  MeatTradingBuildRight: defineAsyncComponent(async () => import("@/features/cards/meat-trading/floor-right")),
  TianJinMeatTradingLeft: defineAsyncComponent(async () => import("@/features/cards/meat-trading/tianjin-build-left")),
  TianJinMeatTradingRight: defineAsyncComponent(async () => import("@/features/cards/meat-trading/tianjin-build-right")),
  TianJinMeatTradingBuildLeft: defineAsyncComponent(async () => import("@/features/cards/meat-trading/tianjin-floor-left")),
  TianJinMeatTradingBuildRight: defineAsyncComponent(async () => import("@/features/cards/meat-trading/tianjin-floor-right")),
  /**
   * 福州儿童医院
   */
  ChildrenHospitalLeft: defineAsyncComponent(async () => import("@/features/cards/children-hospital/left")),
  ChildrenHospitalRight: defineAsyncComponent(async () => import("@/features/cards/children-hospital/right")),
  /**
   * 中亿丰
   * 客流分析
   * 冷热源
   * 广播中心
   */
  PassengerFlowLeft: defineAsyncComponent(async () => import("@/features/cards/passenger-flow/left")),
  PassengerFlowRight: defineAsyncComponent(async () => import("@/features/cards/passenger-flow/right")),
  ColdHeatSourcesLeft: defineAsyncComponent(async () => import("@/features/cards/cold-heat-sources/left")),
  ColdHeatSourcesRight: defineAsyncComponent(async () => import("@/features/cards/cold-heat-sources/right")),
  BroadcastLeft: defineAsyncComponent(async () => import("@/features/cards/broadcast/left")),
  BroadcastRight: defineAsyncComponent(async () => import("@/features/cards/broadcast/right")),

  /**
   * 上海二期 商户管理
   */
  MerchantManageLeft: defineAsyncComponent(async () => import("@/features/cards/merchant-manage/left")),
  MerchantManageRight: defineAsyncComponent(async () => import("@/features/cards/merchant-manage/right")),
  OverviewLeft: defineAsyncComponent(async () => import("@/features/cards/merchant-manage/overviewLeft")),
  OverviewRight: defineAsyncComponent(async () => import("@/features/cards/merchant-manage/overviewRight")),

  /**
   * 南沙国际 电子巡更  电子巡更（海康）
   */
  ElectronicPatrolLeft: defineAsyncComponent(async () => import("@/features/cards/electronicPatrol/left")),
  ElectronicPatrolRight: defineAsyncComponent(async () => import("@/features/cards/electronicPatrol/right")),
  ElectronicPatrolLeftHK: defineAsyncComponent(async () => import("@/features/cards/electronicPatrol/left_hk")),
  ElectronicPatrolRightHK: defineAsyncComponent(async () => import("@/features/cards/electronicPatrol/right_hk")),

  /**
   * 周界防护
   */
  PerimeterLeft: defineAsyncComponent(async () => import("@/features/cards/perimeter/left")),
  PerimeterRight: defineAsyncComponent(async () => import("@/features/cards/perimeter/right")),

  /**
   * 医用气体 新
   */
  MedicalGasNewLeft: defineAsyncComponent(async () => import("@/features/cards/medical-gas-new/left")),
  MedicalGasNewRight: defineAsyncComponent(async () => import("@/features/cards/medical-gas-new/right")),
  MedicalGasNewBuildLeft: defineAsyncComponent(async () => import("@/features/cards/medical-gas-new/build-left")),
  MedicalGasNewBuildRight: defineAsyncComponent(async () => import("@/features/cards/medical-gas-new/build-right")),

  /**
   * 锅炉系统
   */
  BoilerLeft: defineAsyncComponent(async () => import("@/features/cards/boiler/left")),
  BoilerRight: defineAsyncComponent(async () => import("@/features/cards/boiler/right")),

  /**
   *  @说明 污水处理
   */
  SewageDisposalLfet: defineAsyncComponent(async () => import("@/features/cards/sewage-disposal/left")),
  SewageDisposalRight: defineAsyncComponent(async () => import("@/features/cards/sewage-disposal/right")),

  /**
   *  @说明 净化系统
   */
  purificationSystemLfet: defineAsyncComponent(async () => import("@/features/cards/purification-system/left")),
  purificationSystemRight: defineAsyncComponent(async () => import("@/features/cards/purification-system/right")),

  /**
   *  @说明 空气源
   */
  airSourceLfet: defineAsyncComponent(async () => import("@/features/cards/purification-system/left")),
  airSourceRight: defineAsyncComponent(async () => import("@/features/cards/purification-system/right")),

  /**
   *  @说明 净水系统
   */
  waterPurificationLeft: defineAsyncComponent(async () => import("@/features/cards/water-purification/left")),
  waterPurificationRight: defineAsyncComponent(async () => import("@/features/cards/water-purification/right")),

  /**
   *  @说明 物流系统
   */
  logisticsLeft: defineAsyncComponent(async () => import("@/features/cards/logistics/left")),
  logisticsRight: defineAsyncComponent(async () => import("@/features/cards/logistics/right")),

  /**
   *  @说明 计算机网络
   */
  computerNetworkLeft: defineAsyncComponent(async () => import("@/features/cards/computer-network/left")),
  computerNetworkRight: defineAsyncComponent(async () => import("@/features/cards/computer-network/right")),

  /**
   *  @说明 无线通讯
   */
  telecommunicationsLeft: defineAsyncComponent(async () => import("@/features/cards/telecommunications/left")),
  telecommunicationsRight: defineAsyncComponent(async () => import("@/features/cards/computer-network/right")),

  /**
   *  @说明 电梯管理
   */
  liftLeft: defineAsyncComponent(async () => import("@/features/cards/lift-manage/left")),
  liftRight: defineAsyncComponent(async () => import("@/features/cards/lift-manage/right")),

  /**
   *  @说明 新风管理
   */
  freshAirLeft: defineAsyncComponent(async () => import("@/features/cards/fresh-air-manage/left")),
  freshAirRight: defineAsyncComponent(async () => import("@/features/cards/fresh-air-manage/right")),

  /**
   *  @说明 安检通道
   */
  securityCheckLeft: defineAsyncComponent(async () => import("@/features/cards/security-check/left")),
  securityCheckRight: defineAsyncComponent(async () => import("@/features/cards/security-check/right")),

  /**
   *  @说明 楼层设备面板
   */
  floorEquipment: defineAsyncComponent(async () => import("@/features/cards/floorEquipment/right")),
  floorEquipmentLeft: defineAsyncComponent(async () => import("@/features/cards/floorEquipment/left")),
  /**
   *  @说明 漫游设备面板
   */
  RoamingDevices: defineAsyncComponent(async () => import("@/features/cards/roamingDevices/right")),

  /**
   *  @说明 视频监控面板-鹏程小学定制
   */
  VideoMonitoring: defineAsyncComponent(async () => import("@/features/cards/videoMonitoring/right")),

  /***
   * 医用冷冻冷藏
   *
   */
  FreezeLeft: defineAsyncComponent(async () => import("@/features/cards/freeze/left")),
  FreezeRight: defineAsyncComponent(async () => import("@/features/cards/freeze/right")),
  /***
   * 手术示教1.0
   *
   */
  DemonstrationNewLeft: defineAsyncComponent(async () => import("@/features/cards/surgical-demonstration-new/left")),
  DemonstrationNewRight: defineAsyncComponent(async () => import("@/features/cards/surgical-demonstration-new/right")),
  /***
   * 园林系统
   *
   */
  GardensLeft: defineAsyncComponent(async () => import("@/features/cards/gardens/left")),
  GardensRight: defineAsyncComponent(async () => import("@/features/cards/gardens/right")),
  /**
   *  @说明 洁净空调
   */
  CleanConditioningLeft: defineAsyncComponent(async () => import("@/features/cards/telecommunications/left")),
  CleanConditioningRight: defineAsyncComponent(async () => import("@/features/cards/computer-network/right")),
  /**
   *  @说明 园区管理
   */
  ParkManagementLeft: defineAsyncComponent(async () => import("@/features/cards/park-management/left")),
  ParkManagementRight: defineAsyncComponent(async () => import("@/features/cards/park-management/right")),
  /**
   *  @说明 会议管理
   */
  MeetingsLeft: defineAsyncComponent(async () => import("@/features/cards/management-meetings/left")),
  MeetingsRight: defineAsyncComponent(async () => import("@/features/cards/management-meetings/right")),
  /**
   *  @说明 紧急电话
   */
  EmergencyPhoneLeft: defineAsyncComponent(async () => import("@/features/cards/emergency-phone/left")),
  EmergencyPhoneRight: defineAsyncComponent(async () => import("@/features/cards/emergency-phone/right")),
  /**
   *  @说明 交通灯
   */
  TrafficLightLeft: defineAsyncComponent(async () => import("@/features/cards/traffic-light/left")),
  TrafficLightRight: defineAsyncComponent(async () => import("@/features/cards/traffic-light/right")),
  /**
   *  @说明 车流量
   */
  TrafficColumeLeft: defineAsyncComponent(async () => import("@/features/cards/traffic-volume/left")),
  TrafficColumeRight: defineAsyncComponent(async () => import("@/features/cards/traffic-volume/right")),
  /**
   *  @说明 交通控制
   */
  TrafficControlLeft: defineAsyncComponent(async () => import("@/features/cards/trafficControl/left")),
  TrafficControlRight: defineAsyncComponent(async () => import("@/features/cards/traffic-light/right")),
  /**
   * @说明 消防管理业务面板 2.0
   */
  FireControlNewLeft: defineAsyncComponent(async () => import("@/features/cards/fire-controlNew/fire-leftV2")),
  FireControlNewRight: defineAsyncComponent(async () => import("@/features/cards/fire-controlNew/fire-rightV2")),
  FireControlNewFloorRight: defineAsyncComponent(async () => import("@/features/cards/fire-controlNew/fire-floor-right")),
  /**
   * @说明 电气安全业务面板2.0
   */
  ElectricalNewLeft: defineAsyncComponent(async () => import("@/features/cards/electrical-new/electrical-left")),
  ElectricalNewRight: defineAsyncComponent(async () => import("@/features/cards/electrical-new/electrical-right")),
  /**
   * @说明 动环监控2.0
   */
  EnvironmentalMonitorNewLeft: defineAsyncComponent(async () => import("@/features/cards/environmental-new-monitor/left")),
  EnvironmentalMonitorNewRight: defineAsyncComponent(async () => import("@/features/cards/environmental-new-monitor/right")),
  /**
   * @说明 用气管理2.0
   */
  GasManagementLeft: defineAsyncComponent(async () => import("@/features/cards/gas-management/left")),
  GasManagementRight: defineAsyncComponent(async () => import("@/features/cards/gas-management/right")),
  /**
   * @说明 安全管理2.0
   */
  SafetyManagementLeft: defineAsyncComponent(async () => import("@/features/cards/safety-management/left")),
  SafetyManagementRight: defineAsyncComponent(async () => import("@/features/cards/safety-management/right")),
  /**
   *  电子巡更2.0 — 已拆分为卡片面板（ElectronicPatrolNew* / ElectronicPatrolManagement2*），
   *  不再注册 legacy 整板，避免配置端仍指向 New 名时加载未拆分面板。
   */
  // ElectronicPatrolNewLeft / ElectronicPatrolNewRight → panelDefinition 卡片
  /**
   *  指挥调度2.0 — 已拆分为卡片面板（CommandDispatchNew* / commandDispatch*），
   *  不再注册 legacy 整板，避免配置端仍指向 New 名时加载未拆分面板。
   */
  // CommandDispatchNewLeft / CommandDispatchNewRight → panelDefinition 卡片
  /**
   *  应急资源
   */
  EmergencyResourcesLeft: defineAsyncComponent(async () => import("@/features/cards/emergency-resources/left")),
  EmergencyResourcesRight: defineAsyncComponent(async () => import("@/features/cards/emergency-resources/right")),
  /**
   *  智能卡
   */
  SmartCardLeft: defineAsyncComponent(async () => import("@/features/cards/smart-card/left")),
  SmartCardRight: defineAsyncComponent(async () => import("@/features/cards/smart-card/right")),
  /**
   *  环境监测
   */
  EnvironmentalMonitoringLeft: defineAsyncComponent(async () => import("@/features/cards/environmental-monitoring/left")),
  EnvironmentalMonitoringRight: defineAsyncComponent(async () => import("@/features/cards/environmental-monitoring/right")),
  /**
   *  消费管理
   */
  ConsumptionLeft: defineAsyncComponent(async () => import("@/features/cards/consumption/left")),
  ConsumptionRight: defineAsyncComponent(async () => import("@/features/cards/consumption/right")),
  /**
   *  预付费
   */
  PrepaidLeft: defineAsyncComponent(async () => import("@/features/cards/Prepaid/left")),
  PrepaidRight: defineAsyncComponent(async () => import("@/features/cards/Prepaid/right")),
  /**
   *  @说明 能耗通用面板
   */
  EnergyPanel: defineAsyncComponent(async () => import("@/features/cards/energy-consumption/energy-panel")),
  EquipmentPanelDispatch: defineAsyncComponent(async () => import("@/features/equipment/equipmentPanel/businessPanel/dispatch")),
};
/**
 * @说明 设备面板批量导入
 */
export const DevicePanel: Record<string, Component> = {
  MonitorPanel: defineAsyncComponent(async () => import("@/features/equipment/equipmentPanel/monitorPanel")),
  AlarmPanel: defineAsyncComponent(async () => import("@/features/equipment/equipmentPanel/alarmPanel")),
  EquipmentPanelDispatch: defineAsyncComponent(async () => import("@/features/equipment/equipmentPanel/businessPanel/dispatch")),
  EquipmentPanelEalectrical: defineAsyncComponent(async () => import("@/features/equipment/equipmentPanel/businessPanel/electrical")),
  EquipmentPanelSecurity: defineAsyncComponent(async () => import("@/features/equipment/equipmentPanel/businessPanel/security")),
  EquipmentCommonPanel: defineAsyncComponent(async () => import("@/features/equipment/equipmentPanel/equipment-common-panel")),
  EquipmentAbbreviationsPanel: defineAsyncComponent(async () => import("@/features/cards/floorEquipment/device-details-pop")), // 设备缩略弹窗
  EquipmentDetailPanel: defineAsyncComponent(async () => import("@/features/equipment/equipmentdetails/index")), // 设备详情弹窗
  StallDetailPanel: defineAsyncComponent(async () => import("@/features/equipment/equipmentdetails/stall-model/stall-model")), // 档位详情弹窗
  PropertyDetailPanel: defineAsyncComponent(async () => import("@/features/equipment/equipmentdetails/property-model/property-model")), // 资产详情弹窗
  RiskDetailPanel: defineAsyncComponent(async () => import("@/features/equipment/equipmentdetails/risk-model/risk-model")), // 风险源详情弹窗
  GearDetailPanel: defineAsyncComponent(async () => import("@/shared-ui/gearposition/index")),
  TallyingModal: defineAsyncComponent(async () => import("@/features/equipment/equipmentPanel/tallying-modal/tallying-modal")), //理货机 弹窗
  gearDetailsModel: defineAsyncComponent(async () => import("@/features/cards/merchant-manage/components/gear-details-model")), //理货机 弹窗
};
/**
 * @说明 报警弹窗、面板
 */
export const AlarmPanel: Record<string, Component> = {
  AlarmListPanel: defineAsyncComponent(async () => (await import("@/features/equipment/alarmPanel/alarm-list-panel")).AlarmListPanel), //报警列表 右侧面板
  AlarmDetailPanel: defineAsyncComponent(async () => import("@/features/equipment/alarmdetails/equipmentMode")), //报警详情 弹窗
};
