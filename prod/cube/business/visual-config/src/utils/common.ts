// 获取assets静态图片
export const getAssetsFile = (url: string): string => {
  // return new URL(`/resource/visualization/assets/config/images/${url}`, import.meta.url).href
  return `/resource/visualization/assets/config/images/${url}`
}
export const topRegionId = '1111111'
const formatDateTime = (): string => {
  const date = new Date()
  const y = date.getFullYear()
  let m: number | string = date.getMonth() + 1
  m = m < 10 ? ('0' + m.toString()) : m
  let d: number | string = date.getDate()
  d = d < 10 ? ('0' + d.toString()) : d
  const h = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()
  return y.toString() + m.toString() + d.toString() + h.toString() + minute.toString() + second.toString()
}
export const createUuid = (): string => {
  return formatDateTime() + Math.random().toString(36).substr(2)
}
export const treeFindItemById = (list: any[], id: string): any => {
  // 每次进来使用find遍历一次
  let res = list.find((item) => item.id === id)

  if (res) {
    return res
  } else {
    for (let i = 0; i < list.length; i++) {
      if (list[i].children instanceof Array && list[i].children.length > 0) {
        res = treeFindItemById(list[i].children, id)
        if (res) return res
      }
    }

    return null
  }
}
