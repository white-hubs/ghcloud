/**
 * 触发类型枚举值
 */
export enum TriggerType {
  /** 设备属性事件 */
  SIMPLE = "SIMPLE",
  /** 设备阈值事件 */
  SETTING = "SETTING",
  /** 设备原生事件 */
  NATURE = "NATURE",
}

/**
 * 触发类型选项（用于 Select、RadioGroup 等组件）
 * 注意：SETTING 是系统生成的，不能手动创建，所以不在选项中
 */
export const TRIGGER_TYPE_OPTIONS = [
  { label: "设备属性事件", value: TriggerType.SIMPLE },
  { label: "设备原生事件", value: TriggerType.NATURE },
] as const;

/**
 * 触发类型映射表（用于翻译）
 */
export const TRIGGER_TYPE_MAP: Record<string, string> = {
  [TriggerType.SIMPLE]: "设备属性事件",
  [TriggerType.SETTING]: "设备阈值事件",
  [TriggerType.NATURE]: "设备原生事件",
};

/**
 * 获取触发类型标签（翻译函数）
 * @param triggerType 触发类型值（字符串）
 * @returns 触发类型中文标签，如果未找到则返回原值或 "--"
 */
export const getTriggerTypeLabel = (triggerType: string | null | undefined): string => {
  if (triggerType === null || triggerType === undefined || triggerType === "") {
    return "--";
  }
  return TRIGGER_TYPE_MAP[triggerType] ?? triggerType;
};

/**
 * 判断是否为设备属性事件
 */
export const isSimpleTriggerType = (triggerType: string | null | undefined): boolean => triggerType === TriggerType.SIMPLE;

/**
 * 判断是否为设备阈值事件
 */
export const isSettingTriggerType = (triggerType: string | null | undefined): boolean => triggerType === TriggerType.SETTING;

/**
 * 判断是否为设备原生事件
 */
export const isNatureTriggerType = (triggerType: string | null | undefined): boolean => triggerType === TriggerType.NATURE;
