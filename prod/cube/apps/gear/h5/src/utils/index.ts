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

export interface FileState {
  id: string;
  name: string;
  suffix: string;
  path: string;
  size?: number;
  refCount: number;
  type: string;
  businessKey?: string;
}
export const getFileName = (data: FileState): string => {
  if (['docx', 'doc', 'xlsx', 'xls', 'xlsm', 'xltx'].includes(data.type)) {
    return getAssetsFile('word.png')
  } else if (['pdf'].includes(data.type)) {
    return getAssetsFile('pdf.png')
  } else if (['ppt', 'pptx', 'pptm', 'pps'].includes(data.type)) {
    return 'ppt.png'
  } else if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'tiff', 'webp', 'svg', 'raw', 'heic'].includes(data.type)) {
    return data.path
  } else {
    return getAssetsFile('word.png')
  }
}
