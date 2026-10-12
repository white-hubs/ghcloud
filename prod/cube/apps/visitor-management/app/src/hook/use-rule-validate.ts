import { checkPeriodsOverlap, hasArrRepeat } from '@/utils/tool'
import type { Dayjs } from 'dayjs'
import { ref, type Ref } from 'vue'
interface TimeItem {
  value?: [Dayjs, Dayjs] | undefined;
  key: string;
  nextKey?: string;
  totalNumber?: number | undefined;
  startTime?: Dayjs;
  endTime?: Dayjs;
  nextDayBool?: number;
}
interface UseRuleValidate {
  isValid: Ref<boolean>;
  checkTimeList: (timeList: TimeItem[] | undefined) => Promise<unknown>;
}

export const useRuleValidate = (): UseRuleValidate => {
  const isValid = ref(false)
  const checkTimeList = async (timeList: TimeItem[] | undefined): Promise<unknown> => {
    try {
      if (!timeList || timeList.length === 0) {
        isValid.value = false
        return Promise.reject(new Error('请选择访问时间段'))
      }
      if (timeList && timeList.length > 0) {
        const emptyStart = timeList.filter(t => !t.startTime || t.startTime === undefined || t.startTime === null)
        const emptyEnd = timeList.filter(t => !t.endTime || t.endTime === undefined || t.endTime === null)
        if (emptyStart.length > 0 || emptyEnd.length > 0) {
          isValid.value = false
          return Promise.reject(new Error('时间段填写不完整'))
        }
        const emptyNumber = timeList.filter(t => t.totalNumber === undefined || t.totalNumber === null)
        if (emptyNumber.length > 0) {
          isValid.value = false
          return Promise.reject(new Error('访问数量填写不完整'))
        }
        const todayList = timeList.filter(t => !t.nextDayBool)
        const equalTimeErr = todayList.filter(t => t.startTime && t.endTime && t.startTime.valueOf() === t.endTime.valueOf())
        if (equalTimeErr.length > 0) {
          isValid.value = false
          return Promise.reject(new Error('结束时间不能等于开始时间'))
        }
        const endTimeErr = todayList.filter(t => t.startTime && t.endTime && t.startTime.valueOf() > t.endTime.valueOf())
        if (endTimeErr.length > 0) {
          isValid.value = false
          return Promise.reject(new Error('开始时间不能大于结束时间'))
        }
        const todayTimeList = todayList.map(t => [t.startTime, t.endTime])
        if (todayTimeList && todayTimeList.length > 0) {
          const timeErr = checkPeriodsOverlap(todayTimeList as unknown as [Dayjs, Dayjs][])
          if (timeErr) {
            isValid.value = false
            return Promise.reject(new Error('时间段不允许重叠'))
          }
        }
        const newTimeList = timeList.map((t) => {
          const nextKey = `${t.nextDayBool}-${t.startTime}-${t.endTime}`
          return {
            ...t,
            key: t.endTime,
            nextKey,
            totalNumber: t.totalNumber,
            startTime: t.startTime,
            endTime: t.endTime,
            nextDayBool: t.nextDayBool
          }
        })
        const isRepeat = hasArrRepeat(newTimeList as unknown as Record<string | number, string | number | boolean>[], 'nextKey')
        if (isRepeat) {
          isValid.value = false
          return Promise.reject(new Error('时间段不允许重叠'))
        }
      }
      isValid.value = true
      return Promise.resolve()
    } catch {
      isValid.value = true
      return Promise.resolve()
    }
  }
  return {
    isValid,
    checkTimeList,
  }
}
