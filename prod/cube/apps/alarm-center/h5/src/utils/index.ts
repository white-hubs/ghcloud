import dayjs from 'dayjs'
// 获取assets静态资源
export const getAssetsFile = (url: string): string => {
  return new URL(`../assets/images/${url}`, import.meta.url).href
}
// 获取id
export const getUniqueId = (): string => {
  return 'id-' + new Date().getTime().toString(36) + '-' + Math.random().toString(36).substr(2, 9)
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
