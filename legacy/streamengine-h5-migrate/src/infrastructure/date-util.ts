import { TimeMeridiemType, TimeMeridiemTypeLabel } from '../component/basic/date-time-picker/date-time-picker'
import dayjs from 'dayjs'
import arraySupport from 'dayjs/plugin/arraySupport'
import objectSupport from 'dayjs/plugin/objectSupport'
import timezone from 'dayjs/plugin/timezone'
import toArrayPlugin from 'dayjs/plugin/toArray'
import utc from 'dayjs/plugin/utc'

dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.extend(objectSupport)
dayjs.extend(arraySupport)
dayjs.extend(toArrayPlugin)
dayjs.tz.setDefault('')

export enum DateFormat {
  DEFAULT = 'YYYY-MM-DD HH:mm:ss',
  DAY = 'YYYY-MM-DD',
  HOUR = 'YYYY-MM-DD HH',
  MINUTE = 'YYYY-MM-DD HH:mm',
  SECOND = 'YYYY-MM-DD HH:mm:ss',
}

export type DateStringArray = [year: string, month: string, day: string, hour: string, minute: string, second: string]
// 时分秒使用时刻表达（上午/下午）
export type DateStringArrayAsTime = [year: string, month: string, day: string, time: 'AM' | 'PM']
export type DateNumberArray = [year: number, month: number, day: number, hour: number, minute: number, second: number]

export function format (dateOrDateStringArray: Date | string[] | number, fmt: DateFormat | string = DateFormat.DEFAULT): string {
  if (dateOrDateStringArray instanceof Date) {
    return dayjs(dateOrDateStringArray).format(fmt)
  }
  if (typeof dateOrDateStringArray === 'number') {
    return dayjs(dateOrDateStringArray).format(fmt)
  }
  return dayjs(parse(dateOrDateStringArray)).format(fmt)
}

export function parseWithString (dateStr: string, fmt: string = DateFormat.DEFAULT): Date {
  return dayjs(dateStr, fmt).toDate()
}

/**
 * 将日期数组格式化成标准 Date
 *
 * 注意：传入的月是从 1 开始，计算时的月份是从 0 开始的，问题追踪：https://www.zhihu.com/question/263804983/answer/2678276277
 * @param param0 DateStringArray | string[]
 * @returns Date
 */
export function parse ([year, month, day, hour, minute, second]: Partial<DateStringArray> | string[]): Date {
  // TODO(danke): 临时处理 AM,PM 格式问题
  switch (hour) {
    case TimeMeridiemTypeLabel[TimeMeridiemType.MORNING].enName:
      hour = '00'
      break
    case TimeMeridiemTypeLabel[TimeMeridiemType.AFTERNOON].enName:
      hour = '12'
      break
  }
  return dayjs({
    year,
    month: month === undefined ? undefined : parseInt(month) - 1,
    day,
    hour,
    minute,
    second,
  }).toDate()
}

export function toArray (date: Date): DateStringArray {
  const [year, month, day, hour, minute, second] = dayjs(date).toArray()
  return [toString(year, 4), toString(month + 1), toString(day), toString(hour), toString(minute), toString(second)]

  function toString (num: number, finalLength = 2): string {
    const complement = finalLength - num.toString().length
    return `${countToZeroStr(complement)}${num}`
  }
  function countToZeroStr (num: number): string {
    let sb = ''
    for (let i = 0; i < num; i++) {
      sb += '0'
    }
    return sb
  }
}

export function nowTimestamp (): number {
  return Date.now()
}

export function now (): Date {
  return new Date()
}
