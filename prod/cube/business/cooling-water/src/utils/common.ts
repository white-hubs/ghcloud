// 获取assets静态图片
export const getAssetsFile = (url: string): string => {
  // return new URL(`/resource/visualization/assets/config/images/${url}`, import.meta.url).href
  return `/resource/visualization/assets/config/images/${url}`
}
// 用Blob下载表格
export const downloadFileByBlob = (res: BlobPart, fileName: string): void => {
  const link = document.createElement('a')
  const blob = new Blob([res], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })
  link.style.display = 'none'
  link.href = URL.createObjectURL(blob)
  link.setAttribute('download', `${fileName}.xlsx`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
const COOLING_WATER_IMAGES = '/resource/v1/cooling-water/images'
export const getLocalAssetsFile = (url: string): string => `${COOLING_WATER_IMAGES}/${url}`
// 对象转换为path参数
export const convertObjForPath = (data: Record<string, string | null | boolean | []>): string => {
  const result = []
  for (const key in data) {
    const value = data[key]
    if (!value) {
      result.push(`${key}=`)
      continue
    }
    if (value.constructor === Array) {
      value.forEach(function (inValue) {
        result.push(`${key}=${inValue}`)
      })
    } else {
      result.push(`${key}=${value}`)
    }
  }
  return result.join('&')
}
// 加法封装
export const customAdd = (arg1: number, arg2: number): number => {
  let r1 = 0
  let r2 = 0
  let m = 0
  try {
    r1 = arg1.toString().split('.')[1].length
  } catch {
    r1 = 0
  }
  try {
    r2 = arg2.toString().split('.')[1].length
  } catch {
    r2 = 0
  }
  m = Math.pow(10, Math.max(r1, r2))
  return (arg1 * m + arg2 * m) / m
}
