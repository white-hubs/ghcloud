export const AIR_CONDITIONING_PANEL_NAMES = new Set(["AirConditioningManagementLeft", "AirConditioningManagementRight"]);

export const AIR_CONDITIONING_PANEL_CLASS =
  "visual-v2-sub-panel v2-panel-card air-conditioning-v2-panel air-conditioning-card-theme access-control-card-theme";

export const isAirConditioningPanel = (panelName?: string): boolean => {
  return !!panelName && AIR_CONDITIONING_PANEL_NAMES.has(panelName);
};

export const airConditioningZoomClass = [
  "air-conditioning-v2-panel",
  "air-conditioning-card-theme",
  "access-control-card-theme",
  "is-zoom",
];
