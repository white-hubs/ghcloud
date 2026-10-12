import { authStore } from '@/api/auth-store'

// 获取assets静态资源
export const getAssetsFile = (url: string): string => {
  return new URL(`../assets/images/${url}`, import.meta.url).href
}
// 获取路径参数
export const getUrlParams = (): Record<string, string> => {
  const locationHref = window.location.href
  const str = locationHref.split('?')[1]
  if (!str) return {}
  const params = str.split('&')
  const handleParams: Record<string, string> = {}
  for (let i = 0; i < params.length; i++) {
    const g = params[i].split('=')
    handleParams[g[0]] = g[1]
  }
  return handleParams
}

export const groupByField = (array: any[], field: string): Record<string, { dcValue: number;value: number;zhValue: number; time: string;name: string; }[]> => {
  return array.reduce((acc, obj) => {
    const key = obj[field]
    if (!acc[key]) acc[key] = []
    acc[key].push(obj)
    return acc
  }, {})
}

export const goAlarmRecords = (query: {
  startTime?: string;
  endTime?: string;
  alarmStatus?: string;
  alarmTypeCode?: string;
  alarmEventTypeCode?: string;
  alarmLevelCode?: string;
  sourceApp?: string;
}): void => {
  const path = '/apps/alarm-center/h5/#/alarm-records'
  if (query.alarmStatus === 'all') query.alarmStatus = ''
  window.location.href = `${path}?startTime=${query.startTime ?? ''}&endTime=${query.endTime ?? ''}&alarmStatus=${query.alarmStatus ?? ''}&alarmTypeCode=${query.alarmTypeCode ?? ''}&sourceApp=${query.sourceApp ?? ''}&alarmEventTypeCode=${query.alarmEventTypeCode ?? ''}&alarmLevelCode=${query.alarmLevelCode ?? ''}&access_token=${authStore.token ?? ''}&tenant=${authStore.tenant ?? ''}`
}
