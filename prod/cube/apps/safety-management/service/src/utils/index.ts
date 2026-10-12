import dayjs from 'dayjs'

// 计算出环比时间段
export const calculateQoqTime = (period: string[]): string[] => {
  if (period.length < 2) {
    throw new Error('时间范围不正确')
  }
  const startTime = new Date(period[0]).getTime()
  const endTime = new Date(period[1]).getTime()
  const prevStartTime = new Date(startTime - (endTime - startTime))
  const prevEndTime = new Date(startTime)
  return [dayjs(prevStartTime).format('YYYY-MM-DD HH:mm:ss'), dayjs(prevEndTime).format('YYYY-MM-DD HH:mm:ss')]
}
