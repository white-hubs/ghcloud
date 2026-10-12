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
