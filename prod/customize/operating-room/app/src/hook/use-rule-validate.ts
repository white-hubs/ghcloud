import type { SelectValue } from '@/types/monitor-type'
import { ref, type Ref } from 'vue'

interface UseRuleValidate {
  isValid: Ref<boolean>;
  selectValue: Ref<SelectValue[]>;
  lowerLimitChange: (value: number, record: SelectValue) => void;
  upperLimitChange: (value: number, record: SelectValue) => void;
  showAreaChange: (value: number, record: SelectValue) => void;
  sortChange: (value: number, record: SelectValue) => void;
  validate: () => Promise<boolean>;
}

export const useRuleValidate = (): UseRuleValidate => {
  const isValid = ref(false)
  const selectValue = ref<SelectValue[]>([])

  const lowerLimitChange = (value: number | undefined, record: SelectValue): void => {
    if (['airconditioner', 'cleanlinessLevel'].includes(record.normCode)) {
      record.isEdit = false
      record.lowerLimitError = false
      record.upperLimitError = false
      record.showAreaError = false
      record.sortError = false
      return
    }
    if (value === undefined || value === null) {
      record.lowerLimitError = true
      record.lowerLimitErrorMsg = '请输入下限'
      record.isEdit = true
    } else if (record.upperLimit !== undefined && record.upperLimit !== null && value >= record.upperLimit) {
      record.lowerLimitError = true
      record.lowerLimitErrorMsg = '下限不能大于等于上限'
      record.isEdit = true
    } else {
      record.lowerLimitError = false
      record.upperLimitError = false
    }
  }
  const upperLimitChange = (value: number | undefined, record: SelectValue): void => {
    if (['airconditioner', 'cleanlinessLevel'].includes(record.normCode)) {
      record.isEdit = false
      record.lowerLimitError = false
      record.upperLimitError = false
      record.showAreaError = false
      record.sortError = false
      return
    }
    if (value === undefined || value === null) {
      record.upperLimitError = true
      record.upperLimitErrorMsg = '请输入上限'
      record.isEdit = true
    } else if (record.lowerLimit !== undefined && record.lowerLimit !== null && value <= record.lowerLimit) {
      record.upperLimitError = true
      record.upperLimitErrorMsg = '上限不能小于等于小限'
      record.isEdit = true
    } else {
      record.upperLimitError = false
      record.lowerLimitError = false
    }
  }
  const showAreaChange = (value: string | number | undefined, record: SelectValue): void => {
    if (['airconditioner', 'cleanlinessLevel'].includes(record.normCode)) {
      record.isEdit = false
      record.lowerLimitError = false
      record.upperLimitError = false
      record.showAreaError = false
      record.sortError = false
      return
    }
    if (value === undefined || value === null) {
      record.showAreaError = true
      record.showAreaErrorMsg = '请选择展示区域'
      record.isEdit = true
    } else {
      record.showAreaError = false
    }
  }
  const sortChange = (value: string | number | undefined, record: SelectValue): void => {
    if (record.normCode === 'cleanlinessLevel') {
      record.isEdit = false
      record.lowerLimitError = false
      record.upperLimitError = false
      record.showAreaError = false
      record.sortError = false
      return
    }
    if (value === undefined || value === null) {
      record.sortError = true
      record.sortErrorMsg = '请输入展示排序'
      record.isEdit = true
    } else {
      record.sortError = false
    }
  }

  // 按展示区域，展示排序分组
  const groupedByAreaSort = (): Map<string, SelectValue[]> => {
    const groupedData = new Map()
    selectValue.value.forEach(e => {
      let list: SelectValue[] = []
      list = selectValue.value.filter(item => item.showArea === e.showArea && item.sort === e.sort).filter(e => e.normCode !== 'cleanlinessLevel')
      if (list && list.length > 0) {
        groupedData.set(e.showArea, list)
      }
    })
    return groupedData as Map<string, SelectValue[]>
  }
  const validate = async (): Promise<boolean> => {
    try {
      selectValue.value.forEach(e => {
        if (e.display) {
          // showAreaChange(e.showArea, e)
          sortChange(e.sort, e)
          lowerLimitChange(e.lowerLimit, e)
          upperLimitChange(e.upperLimit, e)
        } else {
          e.isEdit = false
          e.lowerLimitError = false
          e.upperLimitError = false
          e.showAreaError = false
          e.sortError = false
        }
        return e
      })
      const groupMap = groupedByAreaSort()
      if (groupMap.size > 0) {
        groupMap.forEach((value) => {
          value.forEach((v, i) => {
            if (v.display) {
              const index = value.filter(vv => vv.showArea !== '' && vv.sort !== undefined).findIndex(vv => vv.sort === v.sort)
              if (index > -1 && index !== i) {
                selectValue.value.forEach(e => {
                  if (e.sort !== undefined && e.normCode === v.normCode) {
                    e.isEdit = true
                    e.sortError = true
                    e.sortErrorMsg = '相同区域内排序不能重复'
                  } else {
                    e.isEdit = false
                    e.sortError = false
                    e.sortErrorMsg = ''
                  }
                })
              }
            }
          })
        })
      }
      isValid.value = !selectValue.value.some((item) => item.showAreaError || item.sortError || item.lowerLimitError || item.upperLimitError)
      if (isValid.value) {
        return true
      } else {
        return false
      }
    } catch {
      isValid.value = false
      return false
    }
  }
  return {
    isValid,
    selectValue,
    lowerLimitChange,
    upperLimitChange,
    showAreaChange,
    sortChange,
    validate,
  }
}
