import { authStore } from '@/api/auth-store'

// 获取assets静态资源
export const getAssetsFile = (url: string): string => {
  return new URL(`../../assets/images/${url}`, import.meta.url).href
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
export const goRiskList = (query: {
  typeCode?: string;
  typeCodeName?: string;
  period: string;
}): void => {
  const path = '/apps/risk-management/h5/#/risk-list'
  window.location.href = `${path}?period=${query.period}&typeCode=${query.typeCode ?? ''}&typeCodeName=${query.typeCodeName ?? ''}&access_token=${authStore.token ?? ''}&tenant=${authStore.tenant ?? ''}`
}
