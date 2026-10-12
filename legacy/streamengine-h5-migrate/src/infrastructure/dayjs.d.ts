import 'dayjs'
declare type DateStringArray = [year: string, month: string, day: string, hour: string, minute: string, second: string]
declare type DateNumberArray = [year: number, month: number, day: number, hour: number, minute: number, second: number]

declare module 'dayjs' {
  interface Dayjs {
    toArray: () => DateNumberArray;
  }
}
