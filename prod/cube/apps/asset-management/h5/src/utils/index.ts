import dayjs from 'dayjs'
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
// 获取时间
export const timeFormat = (time: string | number | Date, status?: boolean): string | null => {
  if (!time) {
    return null
  }
  const date = new Date(time)
  let res = ''
  // 年
  const year = date.getFullYear()
  // 月
  const month =
    date.getMonth() + 1 > 9 ? date.getMonth() + 1 : `0${date.getMonth() + 1}`
  // 日
  const day = date.getDate() > 9 ? date.getDate() : `0${date.getDate()}`
  // 时
  const hour = date.getHours() > 9 ? date.getHours() : `0${date.getHours()}`
  // 分
  const minutes =
    date.getMinutes() > 9 ? date.getMinutes() : `0${date.getMinutes()}`
  // 秒
  const second =
    date.getSeconds() > 9 ? date.getSeconds() : `0${date.getSeconds()}`
  if (status) {
    res = `${year}-${month}-${day} ${hour}:${minutes}:${second}`
  } else {
    res = `${year}-${month}-${day}`
  }
  return res
}
// 获取指定时间段
export const timePeriod = (time?: string): string => {
  if (!time) time = 'TODAY'
  switch (time) {
    case 'TODAY':
      return `${dayjs().format('YYYY-MM-DD')} 00:00:00,${dayjs().format('YYYY-MM-DD')} 23:59:59`
    case 'YESTERDAY':
      return `${dayjs().subtract(1, 'day').format('YYYY-MM-DD')} 00:00:00,${dayjs().subtract(1, 'day').format('YYYY-MM-DD')} 23:59:59`
    case 'WEEK':
      return `${dayjs().startOf('week').format('YYYY-MM-DD')} 00:00:00,${dayjs().endOf('week').format('YYYY-MM-DD')} 23:59:59`
    case 'MONTH':
      return `${dayjs().startOf('month').format('YYYY-MM-DD')} 00:00:00,${dayjs().endOf('month').format('YYYY-MM-DD')} 23:59:59`
    case 'YEAR':
      return `${dayjs().startOf('year').format('YYYY-MM-DD')} 00:00:00,${dayjs().endOf('year').format('YYYY-MM-DD')} 23:59:59`
    default:
      return `${dayjs().format('YYYY-MM-DD')} 00:00:00,${dayjs().format('YYYY-MM-DD')} 23:59:59`
  }
}
