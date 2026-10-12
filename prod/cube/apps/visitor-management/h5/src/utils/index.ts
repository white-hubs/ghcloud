import dayjs from 'dayjs'
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
export const timeFormat = (time: string | number | Date | null, status?: string): string | null => {
  const date = !time ? new Date() : new Date(time)
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
  if (status === 'yyyy-MM-dd HH:mm:ss') {
    res = `${year}-${month}-${day} ${hour}:${minutes}:${second}`
  } else if (status === 'yyyy-MM') {
    res = `${year}-${month}`
  } else {
    res = `${year}-${month}-${day}`
  }
  return res
}
export const dayList = (currentMonth: string): { day: string; week: string;value: string; }[] => {
  const chineseWeek = (day: number): string => {
    let week = ''
    switch (day) {
      case 1:
        week = '周一'
        break
      case 2:
        week = '周二'
        break
      case 3:
        week = '周三'
        break
      case 4:
        week = '周四'
        break
      case 5:
        week = '周五'
        break
      case 6:
        week = '周六'
        break
      default:
        week = '周日'
        break
    }
    return week
  }
  const days = dayjs(currentMonth).daysInMonth()

  const list: (string | number | Date | dayjs.Dayjs | null | undefined)[] = []
  const currentDay = dayjs().date()
  const currentDate = `${dayjs().year()}-${dayjs().month() + 1 > 9 ? dayjs().month() + 1 : `0${dayjs().month() + 1}`}`
  for (let i = 0; i < days; i++) {
    list.push(`${currentMonth}-${i + 1}`)
  }

  const dayList = list.map((x, i) => {
    return {
      day: i + 1 < 10 ? `0${i + 1}` : `${i + 1} `,
      value: i + 1 < 10 ? `${currentMonth}-0${i + 1}` : `${currentMonth}-${i + 1}`,
      week: chineseWeek(dayjs(list[i]).day())
    }
  })
  let dates = []
  if (currentMonth === currentDate) {
    dates = dayList.slice(currentDay - 1, days)
  } else {
    dates = dayList
  }
  return dates
}
// 获取assets静态资源
export const getAssetsFile = (url: string): string => {
  return new URL(`../assets/images/${url}`, import.meta.url).href
}
