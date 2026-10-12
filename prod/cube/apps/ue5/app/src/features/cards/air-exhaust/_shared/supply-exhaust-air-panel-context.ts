import {
  AIR_CONDITIONING_PANEL_CLASS,
  airConditioningZoomClass,
  isAirConditioningPanel,
} from "../../air-conditioning/_shared/air-conditioning-panel-context";

export const SUPPLY_EXHAUST_AIR_PANEL_NAMES = new Set(["SupplyAndExhaustAirLeft", "SupplyAndExhaustAirRight"]);
export const MEETING_MANAGE_PANEL_NAMES = new Set(["MeetingManageLeft", "MeetingManageRight"]);
export const ENERGY_SITUATION_PANEL_NAMES = new Set(["EnergySituationLeft", "EnergySituationRight"]);

/**
 * 送排风与空调管理复用同一套设备类卡片设计令牌，额外保留独立业务类名，
 * 方便后续在不影响空调管理的前提下做业务级微调。
 */
export const SUPPLY_EXHAUST_AIR_PANEL_CLASS = `${AIR_CONDITIONING_PANEL_CLASS} supply-exhaust-air-v2-panel`;

export const ENERGY_SITUATION_PANEL_CLASS = `${AIR_CONDITIONING_PANEL_CLASS} energy-v2-panel energy-situation-v2-panel`;

export const supplyExhaustAirZoomClass = [...airConditioningZoomClass, "supply-exhaust-air-v2-panel"];

export const energySituationZoomClass = [...airConditioningZoomClass, "energy-v2-panel", "energy-situation-v2-panel"];

export const isSupplyExhaustAirPanel = (panelName?: string): boolean => {
  return !!panelName && SUPPLY_EXHAUST_AIR_PANEL_NAMES.has(panelName);
};

export const isEnergySituationPanel = (panelName?: string): boolean => {
  return !!panelName && ENERGY_SITUATION_PANEL_NAMES.has(panelName);
};

export interface EquipmentManagementPanelContext {
  isV2: boolean;
  isAirConditioning: boolean;
  isSupplyExhaustAir: boolean;
  isMeetingManage: boolean;
  isEnergySituation: boolean;
  panelClass?: string;
  zoomClass: string[];
}

export const resolveEquipmentManagementPanelContext = (panelName?: string): EquipmentManagementPanelContext => {
  const isSupplyExhaustAir = isSupplyExhaustAirPanel(panelName);
  const isAirConditioning = isAirConditioningPanel(panelName);
  const isMeetingManage = !!panelName && MEETING_MANAGE_PANEL_NAMES.has(panelName);
  const isEnergySituation = isEnergySituationPanel(panelName);

  if (isSupplyExhaustAir) {
    return {
      isV2: true,
      isAirConditioning: false,
      isSupplyExhaustAir: true,
      isMeetingManage: false,
      isEnergySituation: false,
      panelClass: SUPPLY_EXHAUST_AIR_PANEL_CLASS,
      zoomClass: supplyExhaustAirZoomClass,
    };
  }

  if (isAirConditioning) {
    return {
      isV2: true,
      isAirConditioning: true,
      isSupplyExhaustAir: false,
      isMeetingManage: false,
      isEnergySituation: false,
      panelClass: AIR_CONDITIONING_PANEL_CLASS,
      zoomClass: airConditioningZoomClass,
    };
  }

  if (isMeetingManage) {
    return {
      isV2: true,
      isAirConditioning: false,
      isSupplyExhaustAir: false,
      isMeetingManage: true,
      isEnergySituation: false,
      panelClass: `${AIR_CONDITIONING_PANEL_CLASS} meeting-manage-right-v2-panel`,
      zoomClass: [...airConditioningZoomClass, "meeting-manage-right-v2-panel"],
    };
  }

  if (isEnergySituation) {
    return {
      isV2: true,
      isAirConditioning: false,
      isSupplyExhaustAir: false,
      isMeetingManage: false,
      isEnergySituation: true,
      panelClass: ENERGY_SITUATION_PANEL_CLASS,
      zoomClass: energySituationZoomClass,
    };
  }

  return {
    isV2: false,
    isAirConditioning: false,
    isSupplyExhaustAir: false,
    isMeetingManage: false,
    isEnergySituation: false,
    panelClass: undefined,
    zoomClass: [],
  };
};
