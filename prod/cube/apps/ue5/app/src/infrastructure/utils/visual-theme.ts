export const VISUAL_THEME_CHANGE_EVENT = "visual-theme-change";

export interface VisualThemeChartColors {
  title: string;
  axis: string;
  axisLine: string;
  axisTick: string;
  muted: string;
  splitLine: string;
  ringTick: string;
  tooltipBg: string;
  tooltipBorder: string;
  tooltipText: string;
  label: string;
  dataZoomBg: string;
  dataZoomBorder: string;
  dataZoomFiller: string;
  dataZoomHandle: string;
  dataZoomDataLine: string;
  dataZoomDataArea: string;
}

const getCssVar = (name: string, fallback: string): string => {
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return value || fallback;
};

export const isMinimalWhiteTheme = (): boolean => document.documentElement.dataset.visualTheme === "minimal-white";

/** 成功/在线/已处理：科技蓝霓虹绿，极简白对齐「真实报警」#0f9f5a */
export const getVisualSuccessColor = (): string => getCssVar("--visual-success-color", "#2AE8BD");

const NEON_SUCCESS_COLORS = new Set(["#2AE8BD", "#2ae8bd", "#00F27B", "#00f27b", "#39DA99", "#39da99"]);

export const resolveThemeSuccessColor = (color: string): string => {
  if (!NEON_SUCCESS_COLORS.has(color) || !isMinimalWhiteTheme()) return color;
  return getVisualSuccessColor();
};

export const getVisualThemeChartColors = (): VisualThemeChartColors => {
  return {
    title: getCssVar("--visual-chart-title-color", "#ffffff"),
    axis: getCssVar("--visual-chart-axis-color", "#d0deee"),
    axisLine: getCssVar("--visual-chart-axis-line-color", "rgba(125, 198, 255, 0.55)"),
    axisTick: getCssVar("--visual-chart-axis-tick-color", "rgba(125, 198, 255, 0.45)"),
    muted: getCssVar("--visual-chart-muted-color", "#d0deee"),
    splitLine: getCssVar("--visual-chart-split-line", "rgba(255, 255, 255, 0.15)"),
    ringTick: getCssVar("--visual-ring-tick-color", "rgba(208, 222, 238, 0.55)"),
    tooltipBg: getCssVar("--visual-chart-tooltip-bg", "rgba(3, 11, 27, 0.7)"),
    tooltipBorder: getCssVar("--visual-chart-tooltip-border", "rgba(3, 11, 27, 0.7)"),
    tooltipText: getCssVar("--visual-chart-tooltip-color", "#ffffff"),
    label: getCssVar("--visual-chart-label-color", "#ffffff"),
    dataZoomBg: getCssVar("--visual-chart-datazoom-bg", "rgba(7, 28, 56, 0.35)"),
    dataZoomBorder: getCssVar("--visual-chart-datazoom-border", "rgba(76, 160, 255, 0.28)"),
    dataZoomFiller: getCssVar("--visual-chart-datazoom-filler", "rgba(41, 137, 255, 0.22)"),
    dataZoomHandle: getCssVar("--visual-chart-datazoom-handle", "rgba(125, 198, 255, 0.85)"),
    dataZoomDataLine: getCssVar("--visual-chart-datazoom-data-line", "rgba(125, 198, 255, 0.35)"),
    dataZoomDataArea: getCssVar("--visual-chart-datazoom-data-area", "rgba(41, 137, 255, 0.12)"),
  };
};
