/**
 * 比较类型枚举值
 */
export enum CompareType {
  /** 大于 */
  GT = "GT",
  /** 大于等于 */
  GE = "GE",
  /** 小于 */
  LT = "LT",
  /** 小于等于 */
  LE = "LE",
  /** 等于 */
  EQ = "EQ",
  /** 不等于 */
  NE = "NE",
  /** 包含于集合 */
  IN = "IN",
  /** 不在集合中 */
  NOT_IN = "NOT_IN",
  /** 在区间范围内 */
  BETWEEN = "BETWEEN",
}

/**
 * 比较类型选项（用于 Select 组件）
 */
export const COMPARE_TYPE_OPTIONS = [
  { label: "大于", value: CompareType.GT },
  { label: "大于等于", value: CompareType.GE },
  { label: "小于", value: CompareType.LT },
  { label: "小于等于", value: CompareType.LE },
  { label: "等于", value: CompareType.EQ },
  { label: "不等于", value: CompareType.NE },
  { label: "包含于集合", value: CompareType.IN },
  { label: "不在集合中", value: CompareType.NOT_IN },
  { label: "在区间范围内", value: CompareType.BETWEEN },
] as const;

/**
 * 比较类型映射表（用于翻译）
 */
export const COMPARE_TYPE_MAP: Record<string, string> = {
  [CompareType.GT]: "大于",
  [CompareType.GE]: "大于等于",
  [CompareType.LT]: "小于",
  [CompareType.LE]: "小于等于",
  [CompareType.EQ]: "等于",
  [CompareType.NE]: "不等于",
  [CompareType.IN]: "包含于集合",
  [CompareType.NOT_IN]: "不在集合中",
  [CompareType.BETWEEN]: "在区间范围内",
};

/**
 * 获取比较类型标签（翻译函数）
 * @param compareType 比较类型值（字符串）
 * @returns 比较类型中文标签，如果未找到则返回原值或 "--"
 */
export const getCompareTypeLabel = (compareType: string | null | undefined): string => {
  if (compareType === null || compareType === undefined || compareType === "") {
    return "--";
  }
  return COMPARE_TYPE_MAP[compareType] ?? compareType;
};
