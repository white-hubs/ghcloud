import type { FileVO } from '@ghcloud/cube-todo-center-service/src/type'
import dayjs from 'dayjs'

const TODO_CENTER_IMAGES = '/resource/v1/todo-center/images'
export const getAssetsFile = (url: string): string => `${TODO_CENTER_IMAGES}/${url}`
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
  // if (currentMonth === currentDate) {
  //   dates = dayList.slice(currentDay - 1, days)
  // } else {
  //   dates = dayList
  // }
  dates = dayList
  return dates
}


export const timeTabFormat = (time: string | number | Date | null, status?: string): string | null => {
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

export const getFileName = (data: FileVO): string => {
  if (['docx', 'doc', 'xlsx', 'xls', 'xlsm', 'xltx'].includes(data?.type ?? '')) {
    return getAssetsFile('word.png')
  } else if (['pdf'].includes(data?.type ?? '')) {
    return getAssetsFile('pdf.png')
  } else if (['ppt', 'pptx', 'pptm', 'pps'].includes(data?.type ?? '')) {
    return 'ppt.png'
  } else if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'tiff', 'webp', 'svg', 'raw', 'heic'].includes(data?.type ?? '')) {
    return data?.path ?? ''
  } else {
    return getAssetsFile('word.png')
  }
}

export const typeList = ['doc', 'docx', 'excel', 'xlsx', 'xls', 'pdf', 'ppt', 'txt', 'zip', 'rar']
export const imgType = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'jpge', 'webp', 'mpeg', 'raw', 'heic']

//将base64转换为文件对象
export const dataUrlToFile=(dataUrl: string, filename: string) =>{
  let arr = dataUrl.split(",");
  //@ts-ignore
  let mime = arr[0].match(/:(.*?);/)[1];
  let bstr = atob(arr[1]);
  let n = bstr.length;
  let u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  //转换成file对象
  return new File([u8arr], filename, { type: mime });
}
export const WorkTaskStatus = [
  { value: null, label: '全部' },
  { value: 'TODO', label: '待处理' },
  { value: 'DONE', label: '已处理' },
  { value: 'CREATE', label: '我发布的' },
];
