type ParamsType = Record<string, unknown>

// 过滤空值属性（空字符串、undefined、null）
export function filterEmptyValues<T extends ParamsType> (params: T): Partial<T> {
  if (typeof params !== 'object' || params === null) {
    throw new Error('Invalid input type. Expected an object.')
  }
  return Object.entries(params).reduce<Partial<T>>((acc, [key, value]) => {
    if (value !== '' && value !== undefined && value !== null) {
      // @ts-expect-error: The key is guaranteed to be a keyof T due to the reduce initializer.
      acc[key as keyof T] = value
    }
    return acc
  }, {})
}


export const periodTime = (period: unknown): string => {
  if (period && Array.isArray(period) && period.length === 2) {
    return `${period[0]} 00:00:00,${period[1]} 23:59:59`
  }
  return ''
}