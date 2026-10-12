/**
 * 深度递归合并记录：deepMerge({a: {a1: ''}}, {a: {a2: 1}}) => {a: {a1: '', a2: 1}}
 * @param source 合并的源头
 * @param target 需要合并进入的目标
 * @returns 合并后的结果
 */
export function deepMerge<T extends any | unknown[]> (source: T, target: Partial<T>): T {
  // TODO(danke): 类型不匹配问题
  // @ts-expect-error
  return (source instanceof Array ? mergeArray(source, target) : mergeObject(source, target)) as unknown as T
  function mergeArray<T extends unknown[]> (source: T, target: Partial<T>): T {
    return [...source, ...target] as T
  }
  function mergeObject<T extends Record<string, unknown>> (source: T, target: Partial<T>): T {
    const result = { ...source }
    for (const entry of Object.entries(target)) {
      const [key, value] = entry as [key: keyof T, value: T[keyof T]]
      if (source[key] === undefined || typeof target[key] !== 'object') {
        result[key] = value
        continue
      }
      result[key] = deepMerge(source[key], value)
    }
    return result
  }
}
