import type { DataNode, EventDataNode } from "ant-design-vue/es/tree";
import { ref } from "vue";

import { panelDefinition } from "@ghcloud/cube-visual-sdk";

interface DefaultFileds {
  title?: string;
  key?: string;
  children?: string;
}
interface PanelConfigModifyParams {
  panelPosition: PanelPosition;
  panelConfig: string | null;
  universalPanelParam?: any;
}
export interface PanelType {
  label: string;
  value: string;
  image?: string;
}

export const defaultFileds: DefaultFileds = {
  title: "name",
  key: "id",
  children: "children",
};
export const panelList = ref<PanelType[]>([]);
// demo 面板
const demoPanelList = ref<PanelType[]>([
  {
    label: "门禁管理右面板(展会)",
    value: "demoAccessControlRight",
    image: "门禁管理-园区-右1.png",
  },
  {
    label: "门禁管理左面板(展会)",
    value: "demoAccessControlLeft",
    image: "门禁管理-园区-右1.png",
  },
  {
    label: "停车管理左面板（展会）",
    value: "demoStopManageLeft",
    image: "车辆管理-园区-左1.png",
  },
  {
    label: "停车管理右面板（展会）",
    value: "demoStopManageRight",
    image: "车辆管理-园区-右1.png",
  },
  {
    label: "保供左(展会)",
    value: "SupplyGuaranteeLeft",
    image: "保供-园区-左.png",
  },
  {
    label: "保供右(展会)",
    value: "SupplyGuaranteeRight",
    image: "保供-园区-右.png",
  },
  {
    label: "院区总览左面板(展会)",
    value: "HospitalHomePageLeftDemo",
    image: "院区总览-左.png",
  },
  {
    label: "院区总览右面板(展会)",
    value: "HospitalHomePageRightDemo",
    image: "园区总览-右.png",
  },
  {
    label: "医院总览左面板（展会）",
    value: "HospitalHomePageLeft",
    image: "院区总览-左.png",
  },
  {
    label: "运维态势左面板(展会)",
    value: "OperationLeftDemo",
    image: "运维态势-左.png",
  },
  {
    label: "运维态势右面板(展会)",
    value: "OperationRightDemo",
    image: "运维态势-右.png",
  },
  {
    label: "分诊排号园区左面板(展会)",
    value: "TriageQueueLeft",
    image: "分诊排号-园区-左.png",
  },
  {
    label: "分诊排号园区右面板(展会)",
    value: "TriageQueueRight",
    image: "分诊排号-园区-右.png",
  },
  {
    label: "分诊排号楼层左面板(展会)",
    value: "TriageQueueFloorLeft",
    image: "分诊排号-楼层-左.png",
  },
  {
    label: "分诊排号楼层右面板(展会)",
    value: "TriageQueueFloorRight",
    image: "分诊排号-楼层-右.png",
  },
  {
    label: "手术示教园区左面板(展会)",
    value: "DemonstrationParkLeft",
    image: "手术示教-园区-左.png",
  },
  {
    label: "手术示教园区右面板(展会)",
    value: "DemonstrationParkRight",
    image: "手术示教-园区-右.png",
  },
  {
    label: "手术示教楼栋左面板(展会)",
    value: "DemonstrationBuildingLeft",
    image: "手术示教-楼栋-左.png",
  },
  {
    label: "手术示教楼栋右面板(展会)",
    value: "DemonstrationBuildingRight",
    image: "手术示教-楼栋-右.png",
  },
  {
    label: "手术示教楼层左面板(展会)",
    value: "DemonstrationFloorLeft",
    image: "手术示教-楼层-左.png",
  },
  {
    label: "手术示教楼层右面板(展会)",
    value: "DemonstrationFloorRight",
    image: "手术示教-楼层-右.png",
  },
  {
    label: "电梯监控园区左面板(展会)",
    value: "ElevatorMonitoringParkLeft",
    image: "电梯监控-园区-左.png",
  },
  {
    label: "电梯监控园区右面板(展会)",
    value: "ElevatorMonitoringParkRight",
    image: "电梯监控-园区-右.png",
  },
  {
    label: "电梯监控楼栋左面板(展会)",
    value: "ElevatorMonitoringBuildingLeft",
    image: "电梯监控-楼栋-左.png",
  },
  {
    label: "电梯监控楼栋右面板(展会)",
    value: "ElevatorMonitoringBuildingRight",
    image: "电梯监控-楼栋-右.png",
  },
  {
    label: "医护对讲园区左面板(展会)",
    value: "MedicalIntercomLeft",
    image: "医护对讲-园区-左.png",
  },
  {
    label: "医护对讲园区右面板(展会)",
    value: "MedicalIntercomRight",
    image: "医护对讲-园区-右.png",
  },
  {
    label: "医护对讲楼栋左面板(展会)",
    value: "MedicalIntercomBuildLeft",
    image: "医护对讲-楼栋-左.png",
  },
  {
    label: "医护对讲楼栋右面板(展会)",
    value: "MedicalIntercomBuildRight",
    image: "医护对讲-楼栋-右.png",
  },
  {
    label: "医护对讲楼层左面板(展会)",
    value: "MedicalIntercomFloorLeft",
    image: "医护对讲-楼层-左.png",
  },
  {
    label: "医护对讲楼层右面板(展会)",
    value: "MedicalIntercomFloorRight",
    image: "医护对讲-楼层-右.png",
  },
  {
    label: "智能照明园区左面板(展会)",
    value: "IntelligentLightingLeft",
    image: "智能照明-园区-左.png",
  },
  {
    label: "智能照明园区右面板(展会)",
    value: "IntelligentLightingRight",
    image: "智能照明2-园区-右.png",
  },
  {
    label: "智能照明楼栋左面板(展会)",
    value: "IntelligentLightingBuildLeft",
    image: "智能照明-楼栋-左.png",
  },
  {
    label: "智能照明楼栋右面板(展会)",
    value: "IntelligentLightingBuildRight",
    image: "智能照明-楼栋-右.png",
  },
  {
    label: "智能照明楼层左面板(展会)",
    value: "IntelligentLightingFloorLeft",
    image: "智能照明-楼层-左.png",
  },
  {
    label: "智能照明楼层右面板(展会)",
    value: "IntelligentLightingFloorRight",
    image: "智能照明-楼层-右.png",
  },
  {
    label: "安全态势左面板(展会)",
    value: "SecuritySituationExhibitionLeftDemo",
    image: "安全态势-左.png",
  },
  {
    label: "安全态势右面板(展会)",
    value: "SecuritySituationExhibitionRightDemo",
    image: "安全态势-右.png",
  },
  {
    label: "运营态势左面板(展会)",
    value: "OperationManagementLeftDemo",
    image: "运营态势-左.png",
  },
  {
    label: "运营态势右面板(展会)",
    value: "OperationManagementRightDemo",
    image: "运营态势-右.png",
  },
  {
    label: "能耗态势左面板(展会)",
    value: "EnergyConsumptionLeftDemo",
    image: "能耗态势-左.png",
  },
  {
    label: "能耗态势右面板(展会)",
    value: "EnergyConsumptionRightDemo",
    image: "能耗态势-右.png",
  },
  {
    label: "医用气体园区左面板(展会)",
    value: "MedicalGasLeft",
    image: "医用气体-园区-左.png",
  },
  {
    label: "医用气体园区右面板(展会)",
    value: "MedicalGasRight",
    image: "医用气体-园区-右.png",
  },
  {
    label: "医用气体楼栋左面板(展会)",
    value: "MedicalGasBuildLeft",
    image: "医用气体-楼栋-左.png",
  },
  {
    label: "医用气体楼栋右面板(展会)",
    value: "MedicalGasBuildRight",
    image: "医用气体-楼栋-右.png",
  },
  {
    label: "净水系统-左面板（展会）",
    value: "demoWaterPurificationLeft",
    image: "净水系统-左面板.png",
  },
  {
    label: "安防监控左面板(展会)",
    value: "SecurityMonitorLeftDemo",
  },
  {
    label: "安防监控右面板(展会)",
    value: "SecurityMonitorRightDemo",
  },
  {
    label: "听澜苑总览左面板(展会)",
    value: "HospitalHomePageLeftCommunityDemo",
  },
  {
    label: "听澜苑总览右面板(展会)",
    value: "HospitalHomePageRightCommunityDemo",
  },
  {
    label: "运营态势左面板(展会)",
    value: "OperationManagementLeft",
    image: "运营态势-左.png",
  },
  {
    label: "运营态势右面板(展会)",
    value: "OperationManagementRight",
    image: "运营态势-右.png",
  },
  {
    label: "能耗态势楼层左面板(展会)",
    value: "EnergyConsumptionFloorLeft",
    image: "能耗态势-楼层-左.png",
  },
  {
    label: "能耗态势楼层右面板(展会)",
    value: "EnergyConsumptionFloorRight",
    image: "能耗态势-楼层-右.png",
  },
  {
    label: "资产运营-左面板(展会)",
    value: "AssetOperationLeft",
    image: "猪肉滑轨-左面板.png",
  },
  {
    label: "资产运营-右面板(展会)",
    value: "AssetOperationRight",
    image: "猪肉滑轨-右面板.png",
  },
  {
    label: "能耗态势(法院)左面板(展会)",
    value: "CourtEnergyConsumptionLeftDemo",
    image: "法院庭审左面板.png",
  },
  {
    label: "能耗态势(法院)右面板(展会)",
    value: "CourtEnergyConsumptionRightDemo",
    image: "法院庭审右面板.png",
  },
  {
    label: "粮仓总览右面板(展会)",
    value: "GranaryLeft",
    image: "资产管理右面板.png",
  },
  {
    label: "粮仓总览右面板(展会)",
    value: "GranaryRight",
    image: "资产管理右面板.png",
  },
]);
Object.entries(panelDefinition).map(([key, value]) => {
  if (panelList.value.findIndex((item) => item.value === key) === -1) {
    panelList.value.push({
      label: `${value.name}`,
      value: `${key}`,
    });
  }
});
panelList.value = panelList.value.concat(demoPanelList.value);

export const componentArr = [
  {
    label: "设备离线率",
    value: "DeviceOfflineRate",
  },
  {
    label: "设备总数",
    value: "EquipmentStatusOverview",
  },
  {
    label: "报警级别分布",
    value: "alarmLevel",
  },
  {
    label: "报警处理情况",
    value: "alarmStatus",
  },
  {
    label: "设备报警明细",
    value: "equipmentDetails",
  },
  {
    label: "设备报警率",
    value: "equipmentRate",
  },
  {
    label: "设备报警趋势",
    value: "equipmentTrend",
  },
  {
    label: "设备异常统计",
    value: "equipmentStatistics",
  },
  {
    label: "离线设备明细",
    value: "deviceOfflineDetails",
  },
];
export const energyComponentArr = [
  {
    label: "碳排量分类占比",
    value: "CarbonEmissionRatio",
  },
  {
    label: "区域综合能耗排名Top10",
    value: "CarbonRankingTop10",
  },
  {
    label: "区域综合能耗排名Top5",
    value: "CarbonRankingTop5",
  },
  {
    label: "碳排量趋势图",
    value: "CarbonTrends",
  },
  {
    label: "综合能耗分类占比",
    value: "EnergyConsumptionProportion",
  },
  {
    label: "能耗用能趋势图",
    value: "EnergyConsumptionTrend",
  },
  {
    label: "全年能耗概览",
    value: "EnergyOverview",
  },
  {
    label: "区域用能排名Top10",
    value: "EnergyRankingTop10",
  },
  {
    label: "区域用能排名Top5",
    value: "EnergyRankingTop5",
  },
  {
    label: "能耗用能统计",
    value: "EnergyStatistics",
  },
  {
    label: "综合能耗趋势图",
    value: "EnergyTrend",
  },
  {
    label: "区域碳排量排名Top10",
    value: "RankingComprehensiveConsumptionTop10",
  },
  {
    label: "区域碳排量排名Top5",
    value: "RankingComprehensiveConsumptionTop5",
  },
  {
    label: "分项用能占比",
    value: "SubProportion",
  },
  {
    label: "年度用能趋势图",
    value: "AnnualEnergyConsumptionTrend",
  },
];
export interface SelectType {
  event: "select";
  selected: boolean;
  node: EventDataNode;
  selectedNodes: DataNode[];
  nativeEvent: MouseEvent;
}

export interface PanelConfigType {
  areaId: string | number;
  sceneType: string;
  panelConfigModifyParams: PanelConfigModifyParams[];
}
