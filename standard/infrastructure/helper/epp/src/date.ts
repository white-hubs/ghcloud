import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'
dayjs.locale('zh-cn')

export type DateUnit = 'day' | 'week' | 'month' | 'year'

export class DateUtils {
  public static format (date: Date, formatStr: string): string {
    return dayjs(date).format(formatStr)
  }

  public static getStartOf (date: Date, unit: DateUnit): Date {
    return dayjs(date).startOf(unit).toDate()
  }

  public static getEndOf (date: Date, unit: DateUnit): Date {
    return dayjs(date).endOf(unit).toDate()
  }

  public static toTimeBoundaryPeriodOf (date: Date, unit: DateUnit): Period {
    return new Period(DateUtils.getStartOf(date, unit), DateUtils.getEndOf(date, unit))
  }
}

export class Period {
  public constructor (private readonly start: Date, private readonly end: Date) {}

  public getRange (): [start: Date, end: Date] {
    return [this.start, this.end]
  }

  public format (fmt = 'YYYY-MM-DD HH:mm:ss', separator = ','): string {
    return `${DateUtils.format(this.start, fmt)}${separator}${DateUtils.format(this.end, fmt)}`
  }
}
