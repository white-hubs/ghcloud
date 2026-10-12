import bus from "@/utils/bus";

export interface TopParams {
  applicationCode?: string,
  menuName?: string,
  name?: string,
  key?: string,
  period?: string,
  type?: string,
  param?: Record<string, unknown>,
}

export const topPanelClick = (params: TopParams) => {
  bus.emit("topPanelClick", params)
}

