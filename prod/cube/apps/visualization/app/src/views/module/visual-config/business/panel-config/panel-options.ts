export type PanelOption = {
  label: string;
  value: string;
  /** 是否已在 visual-sdk 中拆分为可配置卡片 */
  split: boolean;
};

type PanelDescribeLike = {
  name: string;
};

/** 展会 / 未拆分演示面板（来自 visual-config demoPanelList） */
export const DEMO_PANEL_OPTIONS: Omit<PanelOption, "split">[] = [
  { label: "门禁管理右面板(展会)", value: "demoAccessControlRight" },
  { label: "门禁管理左面板(展会)", value: "demoAccessControlLeft" },
  { label: "停车管理左面板（展会）", value: "demoStopManageLeft" },
  { label: "停车管理右面板（展会）", value: "demoStopManageRight" },
  { label: "保供左(展会)", value: "SupplyGuaranteeLeft" },
  { label: "保供右(展会)", value: "SupplyGuaranteeRight" },
  { label: "院区总览左面板(展会)", value: "HospitalHomePageLeftDemo" },
  { label: "院区总览右面板(展会)", value: "HospitalHomePageRightDemo" },
  { label: "医院总览左面板（展会）", value: "HospitalHomePageLeft" },
  { label: "运维态势左面板(展会)", value: "OperationLeftDemo" },
  { label: "运维态势右面板(展会)", value: "OperationRightDemo" },
  { label: "分诊排号园区左面板(展会)", value: "TriageQueueLeft" },
  { label: "分诊排号园区右面板(展会)", value: "TriageQueueRight" },
  { label: "分诊排号楼层左面板(展会)", value: "TriageQueueFloorLeft" },
  { label: "分诊排号楼层右面板(展会)", value: "TriageQueueFloorRight" },
  { label: "手术示教园区左面板(展会)", value: "DemonstrationParkLeft" },
  { label: "手术示教园区右面板(展会)", value: "DemonstrationParkRight" },
  { label: "手术示教楼栋左面板(展会)", value: "DemonstrationBuildingLeft" },
  { label: "手术示教楼栋右面板(展会)", value: "DemonstrationBuildingRight" },
  { label: "手术示教楼层左面板(展会)", value: "DemonstrationFloorLeft" },
  { label: "手术示教楼层右面板(展会)", value: "DemonstrationFloorRight" },
  { label: "电梯监控园区左面板(展会)", value: "ElevatorMonitoringParkLeft" },
  { label: "电梯监控园区右面板(展会)", value: "ElevatorMonitoringParkRight" },
  { label: "电梯监控楼栋左面板(展会)", value: "ElevatorMonitoringBuildingLeft" },
  { label: "电梯监控楼栋右面板(展会)", value: "ElevatorMonitoringBuildingRight" },
  { label: "医护对讲园区左面板(展会)", value: "MedicalIntercomLeft" },
  { label: "医护对讲园区右面板(展会)", value: "MedicalIntercomRight" },
  { label: "医护对讲楼栋左面板(展会)", value: "MedicalIntercomBuildLeft" },
  { label: "医护对讲楼栋右面板(展会)", value: "MedicalIntercomBuildRight" },
  { label: "医护对讲楼层左面板(展会)", value: "MedicalIntercomFloorLeft" },
  { label: "医护对讲楼层右面板(展会)", value: "MedicalIntercomFloorRight" },
  { label: "智能照明园区左面板(展会)", value: "IntelligentLightingLeft" },
  { label: "智能照明园区右面板(展会)", value: "IntelligentLightingRight" },
  { label: "智能照明楼栋左面板(展会)", value: "IntelligentLightingBuildLeft" },
  { label: "智能照明楼栋右面板(展会)", value: "IntelligentLightingBuildRight" },
  { label: "智能照明楼层左面板(展会)", value: "IntelligentLightingFloorLeft" },
  { label: "智能照明楼层右面板(展会)", value: "IntelligentLightingFloorRight" },
  { label: "安全态势左面板(展会)", value: "SecuritySituationExhibitionLeftDemo" },
  { label: "安全态势右面板(展会)", value: "SecuritySituationExhibitionRightDemo" },
  { label: "运营态势左面板(展会)", value: "OperationManagementLeftDemo" },
  { label: "运营态势右面板(展会)", value: "OperationManagementRightDemo" },
  { label: "能耗态势左面板(展会)", value: "EnergyConsumptionLeftDemo" },
  { label: "能耗态势右面板(展会)", value: "EnergyConsumptionRightDemo" },
  { label: "医用气体园区左面板(展会)", value: "MedicalGasLeft" },
  { label: "医用气体园区右面板(展会)", value: "MedicalGasRight" },
  { label: "医用气体楼栋左面板(展会)", value: "MedicalGasBuildLeft" },
  { label: "医用气体楼栋右面板(展会)", value: "MedicalGasBuildRight" },
  { label: "净水系统-左面板（展会）", value: "demoWaterPurificationLeft" },
  { label: "安防监控左面板(展会)", value: "SecurityMonitorLeftDemo" },
  { label: "安防监控右面板(展会)", value: "SecurityMonitorRightDemo" },
  { label: "听澜苑总览左面板(展会)", value: "HospitalHomePageLeftCommunityDemo" },
  { label: "听澜苑总览右面板(展会)", value: "HospitalHomePageRightCommunityDemo" },
  { label: "运营态势左面板(展会)", value: "OperationManagementLeft" },
  { label: "运营态势右面板(展会)", value: "OperationManagementRight" },
  { label: "能耗态势楼层左面板(展会)", value: "EnergyConsumptionFloorLeft" },
  { label: "能耗态势楼层右面板(展会)", value: "EnergyConsumptionFloorRight" },
  { label: "资产运营-左面板(展会)", value: "AssetOperationLeft" },
  { label: "资产运营-右面板(展会)", value: "AssetOperationRight" },
  { label: "能耗态势(法院)左面板(展会)", value: "CourtEnergyConsumptionLeftDemo" },
  { label: "能耗态势(法院)右面板(展会)", value: "CourtEnergyConsumptionRightDemo" },
  { label: "粮仓总览左面板(展会)", value: "GranaryLeft" },
  { label: "粮仓总览右面板(展会)", value: "GranaryRight" },
];

/** 已拆分面板优先，其后追加未拆分演示面板 */
export const buildPanelOptions = (panelDefinition: Record<string, PanelDescribeLike>): PanelOption[] => {
  const splitOptions: PanelOption[] = Object.entries(panelDefinition).map(([key, value]) => ({
    label: value.name,
    value: key,
    split: true,
  }));
  const exists = new Set(splitOptions.map((item) => item.value));
  const demoOptions: PanelOption[] = DEMO_PANEL_OPTIONS.filter((item) => !exists.has(item.value)).map((item) => ({
    ...item,
    split: false,
  }));
  return [...splitOptions, ...demoOptions];
};
