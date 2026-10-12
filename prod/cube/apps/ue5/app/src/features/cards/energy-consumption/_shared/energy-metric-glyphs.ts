/** SVG path glyphs for energy metric badges (电 / 水 / 气). */

export const ENERGY_METRIC_GLYPHS = {
  electric: "M13.2 2.5 7.6 13.2h3.7l-1.3 8.3 6.8-12.2h-3.8l.2-6.8Z",
  water: "M12 2.8c.4.6 1.4 2 2.5 3.7 1.7 2.6 3.7 5.8 3.7 8.1a6.2 6.2 0 1 1-12.4 0c0-2.3 2-5.5 3.7-8.1C10.6 4.8 11.6 3.4 12 2.8Z",
  gas: "M12 2.6c2.4 3.1 5.4 5.9 5.4 9.4a5.4 5.4 0 1 1-10.8 0c0-3.5 3-6.3 5.4-9.4Zm0 7.2c-.9 1.1-1.8 2.2-1.8 3.4a1.8 1.8 0 1 0 3.6 0c0-1.2-.9-2.3-1.8-3.4Z",
  default: "M12 3.2a8.8 8.8 0 1 0 0 17.6 8.8 8.8 0 0 0 0-17.6Zm0 2.2a6.6 6.6 0 1 1 0 13.2 6.6 6.6 0 0 1 0-13.2Z",
} as const;

export type EnergyMetricKind = keyof typeof ENERGY_METRIC_GLYPHS;

export const getEnergyMetricKind = (item: { instrumentType?: string; title?: string }): EnergyMetricKind => {
  const type = String(item.instrumentType || "").toLowerCase();
  const title = String(item.title || "");
  if (type.includes("water") || title.includes("水")) return "water";
  if (type.includes("electric") || title.includes("电")) return "electric";
  if (type.includes("gas") || title.includes("燃") || title.includes("气")) return "gas";
  return "default";
};

export const getEnergyMetricGlyph = (item: { instrumentType?: string; title?: string }): string =>
  ENERGY_METRIC_GLYPHS[getEnergyMetricKind(item)];
