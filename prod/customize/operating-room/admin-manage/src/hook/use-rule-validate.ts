import type { StandardItem } from '@/types/test-standard-type'
import { ref, type Ref } from 'vue'

interface UseRuleValidate {
  isValid: Ref<boolean>;
  lowerLimitChange: (value: number, record: StandardItem) => void;
  upperLimitChange: (value: number, record: StandardItem) => void;
  validate: (selectValue: StandardItem[]) => boolean;
}

export const useRuleValidate = (): UseRuleValidate => {
  const isValid = ref(false)

  const lowerLimitChange = (value: number | undefined, record: StandardItem): void => {
    if (value === undefined || value === null) {
      // record.minValError = true
      // record.minValErrorMsg = '请输入下限'
      // record.isEdit = true
    } else if (record.maxVal !== undefined && record.maxVal !== null && value > record.maxVal) {
      record.minValError = true
      record.minValErrorMsg = '下限不能大于等于上限'
      record.isEdit = true
    } else {
      record.minValError = false
      record.maxValError = false
    }
  }
  const upperLimitChange = (value: number | undefined, record: StandardItem): void => {
    if (value === undefined || value === null) {
      // record.maxValError = true
      // record.maxValErrorMsg = '请输入上限'
      // record.isEdit = true
    } else if (record.minVal !== undefined && record.minVal !== null && value < record.minVal) {
      record.maxValError = true
      record.maxValErrorMsg = '上限不能小于等于小限'
      record.isEdit = true
    } else {
      record.maxValError = false
      record.minValError = false
    }
  }
  const validate = (items: StandardItem[]): boolean => {
    try {
      items.forEach(e => {
        lowerLimitChange(e.minVal, e)
        upperLimitChange(e.maxVal, e)
        return e
      })
      isValid.value = !items.some((item) => item.minValError || item.maxValError)
      return isValid.value
    } catch {
      isValid.value = false
      return false
    }
  }

  return {
    isValid,
    lowerLimitChange,
    upperLimitChange,
    validate,
  }
}
