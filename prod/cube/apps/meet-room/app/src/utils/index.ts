/**
 * 获取时间段
 * @param {*} step  分割的粒度（分钟）
 * @returns
 */
export function generateTimes (step: number = 30, endZero: boolean = true): string[] {
  const size = Math.floor(24 * 60 / step)
  const timeArrays = new Array(size).fill('').map((item: string, index: number) => {
    const startVal = index * step
    const endVal = (index + 1) * step
    const startHour = Math.floor(startVal / 60)
    const startMinute = startVal % 60
    const endHour = Math.floor(endVal / 60)
    const endMinute = endVal % 60
    const startTime = ((startHour < 10) ? ('0' + startHour) : startHour) + ':' + (startMinute === 0 ? '00' : startMinute)
    let endTime = ((endHour < 10) ? ('0' + endHour) : endHour) + ':' + (endMinute === 0 ? '00' : endMinute)
    const flag = endZero && endTime.includes('24')
    endTime = flag ? '00:00' : endTime
    return startTime + ' - ' + endTime
  })

  return timeArrays
}
