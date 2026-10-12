import type { Dayjs } from 'dayjs'

export const isDateRangeInvalid = (start: Dayjs | null | undefined, end: Dayjs | null | undefined): boolean => {
  if (!start || !end) return false
  return start.isAfter(end, 'day')
}
