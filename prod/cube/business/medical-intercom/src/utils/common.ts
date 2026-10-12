// 获取assets静态图片
export const getAssetsFile = (url: string): string => {
  // return new URL(`/resource/visualization/assets/config/images/${url}`, import.meta.url).href
  return `/resource/visualization/assets/config/images/${url}`
}
export const getDate = (timestamp?: number, format = 'YYYY-MM-DD'): string => {
  const currentDate = timestamp ? new Date(timestamp) : new Date()
  const year = currentDate.getFullYear().toString()
  const month = (currentDate.getMonth() + 1).toString() // 月份从0开始，所以要加1
  const day = currentDate.getDate() < 10 ? '0' + currentDate.getDate().toString() : currentDate.getDate().toString()
  const hours = currentDate.getHours().toString()
  const minutes = currentDate.getMinutes().toString()
  const seconds = currentDate.getSeconds().toString()
  let date = ''
  if (format === 'YYYY-MM-DD') {
    date = year + '-' + month + '-' + day
  }
  if (format === 'YYYY-MM-DD HH:mm:ss') {
    date = year + '-' + month + '-' + day + ' ' + hours + ':' + minutes + ':' + seconds
  }
  return date
}
