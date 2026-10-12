// 获取assets静态图片
export const getAssetsFile = (url: string) => {
  // return new URL(`/resource/visualization/assets/config/images/${url}`, import.meta.url).href
  return `/resource/visualization/assets/config/images/${url}`
}

export function getXdataByType (type: string, data: any[]): any[] {
  const XData = [...data]; let unit = ''
  switch (type) {
    case 'TODAY':
      unit = '时'
      break
    case 'THIS_WEEK':
      unit = '日'
      break
    case 'THIS_MONTH':
      unit = '日'
      break
    case 'THIS_YEAR':
      unit = '月'
      break
    default:
      unit = '时'
      break
  }
  XData[data.length - 1] = XData[data.length - 1] + unit
  return XData
}

export const getallNumber = (data: any, value: string) => {
  let total = 0
  data.forEach((_i: string, index: number) => {
    total += data[index][value]
  })

  return total
}
