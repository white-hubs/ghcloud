export const executeCycleOptions = [
  {
    label: '每日',
    value: 'EVERY_DAY'
  },
  {
    label: '每周',
    value: 'EVERY_WEEK'
  },
  {
    label: '每月',
    value: 'EVERY_MONTH'
  },
]
export const weekCycleOptions = Array.from({ length: 7 }, (v, k) => ({ label: `周${['日', '一', '二', '三', '四', '五', '六'][k]}`, value: k + 1 + '' }))
//  第一个和最后一个交换位置：将周日移到末尾
const firstItem = weekCycleOptions.shift()
if (firstItem) {
  weekCycleOptions.push(firstItem)
}
export const monthCycleOptions = Array.from({ length: 30 }, (v, k) => ({ label: `${k + 1}号`, value: k + 1 + '' }))
