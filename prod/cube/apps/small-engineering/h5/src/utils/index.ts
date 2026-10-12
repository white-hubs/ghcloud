const SMALL_ENGINEERING_IMAGES = '/resource/v1/small-engineering/images'
export const getAssetsFile = (url: string): string => `${SMALL_ENGINEERING_IMAGES}/${url}`
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

export const typeList = ['doc', 'docx', 'excel', 'xlsx', 'xls', 'pdf', 'ppt', 'txt', 'zip', 'rar']
export const imgType = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'jpge', 'webp', 'mpeg', 'raw', 'heic']
