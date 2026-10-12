import dayjs from 'dayjs'

export class DateUtils {
  public static format (date: Date, formatStr: string): string {
    return dayjs(date).format(formatStr)
  }
}
