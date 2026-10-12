import dayjs from 'dayjs'

/** 在某个时间范围内 */
export const isTimeRange = (time: string, period: string[]): boolean => {
  if (!period || !time) return false
  const targetDay = dayjs(time)
  const startDay = dayjs(period[0])
  const endDay = dayjs(period[1])
  return !targetDay.isBefore(startDay) && !targetDay.isAfter(endDay)
}

export const getImage = (url: string): string => {
  return new URL(`../assets/images/${url}`, import.meta.url).href
}
