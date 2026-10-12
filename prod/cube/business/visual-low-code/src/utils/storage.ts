export enum StorageEmun {
  'CHART_CONFIG' = 'chartConfig',
  'GH_TOKEN' = 'GH-Token',
  'GH_NOWENTERPRISE' = 'GH-NowEnterprise',
  'PROJECTID' = 'projectId',
  'INSTANCEID' = 'instanceId'
}
/**
 * * 存储临时会话数据
 * @param k 键名
 * @param v 键值
 * @returns RemovableRef
 */
export const setSessionStorage = async <T>(k: string, v: T): Promise<void> => {
  window.sessionStorage.setItem(k, JSON.stringify(v))
}

/**
 * * 获取临时会话数据
 * @returns any
 */
export const getSessionStorage = (k: string): unknown => {
  const item = window.sessionStorage.getItem(k)
  try {
    return item ? JSON.parse(item) : item
  } catch (err) {
    return item
  }
}

/**
 * * 清除本地会话数据
 * @param name
 */
export const clearSessioStorage = (name: StorageEmun): void => {
  window.sessionStorage.removeItem(name)
}
