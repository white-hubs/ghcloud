/**
 * 数据类型枚举值
 */
export enum DataType {
  /** 整型 */
  INT = "int",
  /** 长整型 */
  LONG = "long",
  /** 单精度浮点型 */
  FLOAT = "float",
  /** 双精度浮点型 */
  DOUBLE = "double",
  /** 布尔型 */
  BOOLEAN = "boolean",
  /** 字符串 */
  STRING = "string",
  /** 枚举 */
  ENUM = "enum",
}

/**
 * 数据类型选项（用于 Select 组件）
 */
export const DATA_TYPE_OPTIONS: { label: string; value: string }[] = [
  { label: "整型", value: DataType.INT },
  { label: "长整型", value: DataType.LONG },
  { label: "单精度浮点型", value: DataType.FLOAT },
  { label: "双精度浮点型", value: DataType.DOUBLE },
  { label: "布尔型", value: DataType.BOOLEAN },
  { label: "字符串", value: DataType.STRING },
  { label: "枚举", value: DataType.ENUM },
];

/**
 * 数值类型（整型和浮点型）
 */
export const NUMERIC_TYPES = [DataType.INT, DataType.LONG, DataType.FLOAT, DataType.DOUBLE] as const;

/**
 * 浮点类型
 */
export const FLOAT_TYPES = [DataType.FLOAT, DataType.DOUBLE] as const;

/**
 * 整型类型
 */
export const INTEGER_TYPES = [DataType.INT, DataType.LONG] as const;

/**
 * 选择类型（需要下拉选择的数据类型）
 */
export const SELECT_TYPES = [DataType.ENUM, DataType.BOOLEAN] as const;

/**
 * 判断是否为数值类型
 */
export const isNumericType = (dataType: string): boolean => NUMERIC_TYPES.includes(dataType as (typeof NUMERIC_TYPES)[number]);

/**
 * 判断是否为浮点类型
 */
export const isFloatType = (dataType: string): boolean => FLOAT_TYPES.includes(dataType as (typeof FLOAT_TYPES)[number]);

/**
 * 判断是否为整型类型
 */
export const isIntegerType = (dataType: string): boolean => INTEGER_TYPES.includes(dataType as (typeof INTEGER_TYPES)[number]);

/**
 * 判断是否为选择类型
 */
export const isSelectType = (dataType: string): boolean => SELECT_TYPES.includes(dataType as (typeof SELECT_TYPES)[number]);

/**
 * 获取数据类型标签（翻译函数）
 * @param dataType 数据类型值（如 "int", "long" 等）
 * @returns 数据类型中文标签，如果未找到则返回原值或 "--"
 */
export const getDataTypeLabel = (dataType: string | null | undefined): string => {
  if (dataType === null || dataType === undefined || dataType === "") {
    return "--";
  }
  const option = DATA_TYPE_OPTIONS.find((item) => item.value === dataType);
  return option?.label ?? dataType;
};
