import type { VisualTheme } from "@/visualization-core/hooks/use-visual-theme";

export interface EnergyTrendSeriesStyle {
  linearGradientColor: [string, string];
  lineColor: string;
}

export const getEnergyTrendSeriesStyle = (theme: VisualTheme): EnergyTrendSeriesStyle => {
  if (theme === "minimal-white") {
    return {
      linearGradientColor: ["rgba(47, 127, 232, 0.42)", "rgba(47, 127, 232, 0.05)"],
      lineColor: "#2F7FE8",
    };
  }
  return {
    linearGradientColor: ["rgba(120, 252, 252, 0.85)", "rgba(120, 252, 252, 0.08)"],
    lineColor: "rgba(120, 252, 252, 1)",
  };
};

export const applyEnergyTrendSeriesStyle = (series: { linearGradientColor?: string[]; lineColor?: string }, theme: VisualTheme): void => {
  const style = getEnergyTrendSeriesStyle(theme);
  series.linearGradientColor = [...style.linearGradientColor];
  series.lineColor = style.lineColor;
};
