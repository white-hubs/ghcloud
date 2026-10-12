/**
 * 方法类型（执行方式）枚举值
 */
export enum MethodType {
  /** 同步 */
  SYNC = "sync",
  /** 异步 */
  ASYNC = "async",
}

/**
 * 方法类型选项（用于 RadioGroup、Select 等组件）
 */
export const METHOD_TYPE_OPTIONS: { label: string; value: string }[] = [
  { label: "同步", value: MethodType.SYNC },
  { label: "异步", value: MethodType.ASYNC },
];

/**
 * 方法类型映射表（用于翻译）
 */
export const METHOD_TYPE_MAP: Record<string, string> = {
  [MethodType.SYNC]: "同步",
  [MethodType.ASYNC]: "异步",
};

/**
 * 获取方法类型标签（翻译函数）
 * @param methodType 方法类型值（如 "sync", "async"）
 * @returns 方法类型中文标签，如果未找到则返回原值或 "--"
 */
export const getMethodTypeLabel = (methodType: string | null | undefined): string => {
  if (methodType === null || methodType === undefined || methodType === "") {
    return "--";
  }
  return METHOD_TYPE_MAP[methodType] ?? methodType;
};
