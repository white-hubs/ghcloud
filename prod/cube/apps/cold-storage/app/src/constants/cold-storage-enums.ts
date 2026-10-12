export interface EnumOption<T extends string = string> {
  label: string;
  value: T;
}

export const ColdStoreType = {
  FIXED: "FIXED",
  MOBILE_REFRIGERATED_TRUCK: "MOBILE_REFRIGERATED_TRUCK",
  MOBILE_CABIN: "MOBILE_CABIN",
} as const;

export type ColdStoreType = (typeof ColdStoreType)[keyof typeof ColdStoreType];

export const ColdStoreTypeLabel: Record<ColdStoreType, string> = {
  [ColdStoreType.FIXED]: "固定式冷库",
  [ColdStoreType.MOBILE_REFRIGERATED_TRUCK]: "移动式冷藏车",
  [ColdStoreType.MOBILE_CABIN]: "移动式方舱",
};

export const coldStoreTypeOptions: EnumOption<ColdStoreType>[] = Object.entries(ColdStoreTypeLabel).map(([value, label]) => ({
  label,
  value: value as ColdStoreType,
}));

export const RefrigerationMethod = {
  AMMONIA: "AMMONIA",
  FREON: "FREON",
  CO2: "CO2",
} as const;

export type RefrigerationMethod = (typeof RefrigerationMethod)[keyof typeof RefrigerationMethod];

export const RefrigerationMethodLabel: Record<RefrigerationMethod, string> = {
  [RefrigerationMethod.AMMONIA]: "氨制冷",
  [RefrigerationMethod.FREON]: "氟利昂制冷",
  [RefrigerationMethod.CO2]: "二氧化碳制冷",
};

export const refrigerationMethodOptions: EnumOption<RefrigerationMethod>[] = Object.entries(RefrigerationMethodLabel).map(
  ([value, label]) => ({
    label,
    value: value as RefrigerationMethod,
  }),
);

export const enumLabelOf = <T extends string>(options: EnumOption<T>[], value: string): string =>
  options.find((item) => item.value === value)?.label ?? value;
