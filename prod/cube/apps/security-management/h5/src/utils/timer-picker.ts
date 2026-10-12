import dayjs from 'dayjs'

export const timeOptions = [
  { label: '今日', value: 'TODAY' },
  { label: '本周', value: 'THIS_WEEK' },
  { label: '本月', value: 'THIS_MONTH' },
  { label: '今年', value: 'THIS_YEAR' },
]
export const getPeriodFormat = (timeEnum: string): string => {
  let res = ''
  switch (timeEnum) {
    case 'TODAY':
      res = dayjs().startOf('day').format('YYYY-MM-DD HH:mm:ss') + ',' + dayjs().endOf('day').format('YYYY-MM-DD HH:mm:ss')
      break
    case 'THIS_WEEK':
      res = dayjs().startOf('week').format('YYYY-MM-DD HH:mm:ss') + ',' + dayjs().endOf('week').format('YYYY-MM-DD HH:mm:ss')
      break
    case 'THIS_MONTH':
      res = dayjs().startOf('month').format('YYYY-MM-DD HH:mm:ss') + ',' + dayjs().endOf('month').format('YYYY-MM-DD HH:mm:ss')
      break
    case 'THIS_YEAR':
      res = dayjs().startOf('year').format('YYYY-MM-DD HH:mm:ss') + ',' + dayjs().endOf('year').format('YYYY-MM-DD HH:mm:ss')
      break
    default:
      break
  }
  return res
}
