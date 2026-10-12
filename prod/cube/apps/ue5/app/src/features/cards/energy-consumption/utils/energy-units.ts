/** 能耗仪表类型对应展示单位 */
export const ENERGY_UNIT_BY_TYPE: Record<string, string> = {
  electricity_meter: "kWh",
  water_meter: "m³",
  gas_meter: "m³",
  fuel_meter: "L",
  heat_meter: "kg",
  cool_meter: "m³",
  renewable_energy: "kWh",
  other: "kWh",
  carbon: "kgCO₂e",
  zh: "tce",
};

const UNIT_ALREADY_RE = /kwh|kw·h|m³|m3|\bt\b|tce|kgco|l\b/i;

/** 按仪表类型取单位 */
export const getEnergyUnit = (instrumentType?: string): string => {
  if (!instrumentType) return "";
  return ENERGY_UNIT_BY_TYPE[instrumentType] || "";
};

/** 标题补全单位，如 电 → 电 kWh；已含单位则不重复 */
export const withEnergyUnit = (instrumentType: string | undefined, name: string): string => {
  const unit = getEnergyUnit(instrumentType);
  if (!unit || !name) return name || "";
  if (UNIT_ALREADY_RE.test(name) || name.includes(unit)) return name;
  return `${name} ${unit}`;
};

/** 按电/水/气标题文案取单位（用于分项分析等） */
export const getEnergyUnitByTitle = (title: string): string => {
  if (!title) return "";
  if (title.includes("电")) return "kWh";
  if (title.includes("水")) return "m³";
  if (title.includes("气") || title.includes("燃")) return "m³";
  return "";
};
