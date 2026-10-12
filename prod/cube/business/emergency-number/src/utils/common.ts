// 获取assets静态图片
export const getAssetsFile = (url: string): string => {
  // return new URL(`/resource/visualization/assets/config/images/${url}`, import.meta.url).href
  return `/resource/visualization/assets/config/images/${url}`
}
export const getDate = (): string => {
  const currentDate = new Date()
  const year = currentDate.getFullYear()
  const month = currentDate.getMonth() + 1 // 月份从0开始，所以要加1
  const day = currentDate.getDate() < 10 ? `0${currentDate.getDate()}` : currentDate.getDate()
  return year.toString() + '-' + month.toString() + '-' + day.toString()
}
export const timestampToDate = (timestamp: number): string => {
  const date = new Date(timestamp)
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate() < 10 ? `0${date.getDate()}` : date.getDate()
  return year.toString() + '-' + month.toString() + '-' + day.toString() + ' '
}
export const timestampToTime = (timestamp: number): string => {
  const date = new Date(timestamp)
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getDate() < 10 ? `0${date.getDate()}` : date.getDate()
  return hour.toString() + ':' + minute.toString() + ':' + second.toString()
}
