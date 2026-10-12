import { inject, type InjectionKey } from "vue";

/** 放大详情弹窗内图表：横轴完整展示、禁用 dataZoom 滚动 */
export const PANEL_ZOOM_CHART_KEY: InjectionKey<true> = Symbol("panel-zoom-chart");

export const useIsPanelZoomChart = (): boolean => inject(PANEL_ZOOM_CHART_KEY, false) === true;

/**
 * 是否启用横轴滚动：
 * - 显式传入 true/false 时以传入为准
 * - 否则：放大弹窗内关闭滚动，卡片内开启
 */
export const resolveChartScrollable = (explicitScrollable: boolean | null | undefined): boolean => {
  if (explicitScrollable === true || explicitScrollable === false) return explicitScrollable;
  return !useIsPanelZoomChart();
};
