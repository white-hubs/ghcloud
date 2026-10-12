import type { GroupDataItem } from '@/typings/gateway'
import { ref, type Ref } from 'vue'

interface ValidateTable {
  tableData: Ref<GroupDataItem[]>;
  validateForm: () => void;
  isValidate: Ref<boolean>;
  groupNameChange: (e: { target: { value: string; }; }, record: GroupDataItem) => void;
  groupNumberChange: (e: { target: { value: string; }; }, record: GroupDataItem) => void;
  virtualCodeChange: (e: { target: { value: string; }; }, record: GroupDataItem) => void;
}
// 1. 如果设备名称有相同的， 那么对应的编码必须相同
//    如果编码相同，那么对应的设备名称必须相同
//    如果设备名称相同，编码不同；或者编码相同，设备名称不同；不允许提交，提示输入错误
// 2. 保存时验证，如果设备和设备编码都相同，那么对应的一组数据，属性标识要唯一
export const useValidateTable = (): ValidateTable => {
  const tableData = ref<GroupDataItem[]>([])
  const isValidate = ref(false)

  const validateEmpty = async (): Promise<void> => {
    //  允许设备编码-设备名称-属性标识同时为空，提交时过滤非空数据

    tableData.value.forEach(e => {
      if (!e.groupName && !e.groupNumber && !e.virtualCode) {
        e.groupNameError = false
        e.groupNumberError = false
        e.virtualCodeError = false
        return
      }
      if (!e.groupName) {
        e.groupNameError = true
        e.groupNameErrorMsg = '请输入设备名称'
      } else {
        e.groupNameError = false
      }
      if (!e.groupNumber) {
        e.groupNumberError = true
        e.groupNumberErrorMsg = '请输入设备编码'
      } else {
        e.groupNumberError = false
      }
      if (!e.virtualCode) {
        e.virtualCodeError = true
        e.virtualCodeErrorMsg = '请输入属性标识'
      } else {
        e.virtualCodeError = false
      }
    })
    if (tableData.value.some(item => item.groupNumberError || item.groupNumberError || item.virtualCodeError)) {
      isValidate.value = false
    } else {
      isValidate.value = true
    }
  }

  // 按设备名称，编码分组
  const groupedDataByName = (param: {
    groupName?: boolean;
    groupNumber?: boolean;
  }): Map<string, GroupDataItem[]> => {
    const groupedData = new Map()
    tableData.value.forEach(e => {
      let list = []
      if (param.groupName && param.groupNumber) {
        list = tableData.value.filter(item => item.groupNumber === e.groupNumber && item.groupName === e.groupName)
      } else if (!param.groupName && param.groupNumber) {
        list = tableData.value.filter(item => item.groupNumber === e.groupNumber)
      } else {
        list = tableData.value.filter(item => item.groupName === e.groupName)
      }
      if (list && list.length > 0) {
        groupedData.set(e.groupName, list)
      }
    })
    return groupedData
  }
  const validateForm = (): void => {
    validateEmpty()
    const groupMap = groupedDataByName({
      groupName: true,
      groupNumber: true
    })
    const groupNameMap = groupedDataByName({
      groupName: true,
      groupNumber: false
    })
    const groupNumberMap = groupedDataByName({
      groupName: false,
      groupNumber: true
    })

    if (groupNameMap.size > 0) {
      groupNameMap.forEach((value, key) => {
        value.forEach((v, i) => {
          const index = value.filter(vv => vv.groupNumber && vv.groupNumber !== '').findIndex(vv => vv.groupNumber !== v.groupNumber)
          if (index > -1 && index !== i) {
            tableData.value.forEach(e => {
              if (e.groupNumber && e.id === v.id) {
                // e.groupNumberError = true
                // e.groupNumberErrorMsg = `设备“${key}”下存在不一致的设备编码`
              } else if (!e.groupNumber) {
                e.groupNumberError = true
                e.groupNumberErrorMsg = '请输入设备编码'
              } else {
                e.groupNumberError = false
              }
            })
          }
        })
      })
    }
    if (tableData.value.some(e => e.groupNumberError)) {
      isValidate.value = false
      return
    } else {
      isValidate.value = true
    }
    if (groupNumberMap.size > 0) {
      groupNumberMap.forEach((value) => {
        value.forEach((v) => {
          const index = value.filter(vv => vv.groupName && vv.groupName !== '').findIndex(vv => vv.groupName !== v.groupName)
          if (index > -1) {
            tableData.value.forEach(e => {
              if (e.groupName && e.id === v.id) {
                e.groupNameError = true
                e.groupNameErrorMsg = `设备编码“${v.groupNumber}”下存在不一致的设备名称`
              } else if (!e.groupName) {
                e.groupNameError = true
                e.groupNameErrorMsg = '请输入设备名称'
              } else {
                e.groupNameError = false
              }
            })
          }
        })
      })
    }
    if (tableData.value.some(e => e.groupNameError)) {
      isValidate.value = false
      return
    } else {
      isValidate.value = true
    }

    if (groupMap.size > 0) {
      groupMap.forEach((value, key) => {
        value.forEach((v, i) => {
          const index = value.filter(vv => vv.virtualCode && vv.virtualCode !== '').findIndex(vv => vv.virtualCode === v.virtualCode)
          if (index > -1 && index !== i) {
            tableData.value.forEach(e => {
              if (e.virtualCode && e.id === v.id) {
                e.virtualCodeError = true
                e.virtualCodeErrorMsg = !v.virtualCode ? '请输入属性标识' : `设备“${key}”下存在重复的属性标识`
              } else if (!e.virtualCode) {
                e.virtualCodeError = true
                e.virtualCodeErrorMsg = '请输入属性标识'
              } else {
                e.virtualCodeError = false
              }
            })
          }
        })
      })
    }
    if (tableData.value.some(e => e.virtualCodeError)) {
      isValidate.value = false
    } else {
      isValidate.value = true
    }
  }
  const groupNameChange = (ele: { target: { value: string; }; }, record: GroupDataItem): void => {
    tableData.value = tableData.value.map(e => {
      if (record.id === e.id) {
        const inputValue = ele.target.value
        e.groupName = inputValue.replace(/\s/g, '')
        e.handle = true
        if (!inputValue) {
          e.groupNameError = true
          e.groupNameErrorMsg = '请输入设备名称'
        } else {
          e.groupNameError = false
          validateForm()
        }
      }
      return e
    })
  }
  const groupNumberChange = (ele: { target: { value: string; }; }, record: GroupDataItem): void => {
    tableData.value = tableData.value.map(e => {
      if (record.id === e.id) {
        const inputValue = ele.target.value
        e.groupNumber = inputValue.replace(/\s/g, '')
        e.handle = true
        if (!e.groupNumber) {
          e.groupNumberError = true
          e.groupNumberErrorMsg = '请输入设备编码'
        } else {
          e.groupNumberError = false
        }
      }
      return e
    })
  }
  const virtualCodeChange = (ele: { target: { value: string; }; }, record: GroupDataItem): void => {
    tableData.value = tableData.value.map(e => {
      if (record.id === e.id) {
        const inputValue = ele.target.value
        e.virtualCode = inputValue.replace(/[\u4e00-\u9fa5\u3000-\u303f\uff00-\uffef\s]/g, '')
        e.handle = true
        if (!e.virtualCode) {
          e.virtualCodeError = true
          e.virtualCodeErrorMsg = '请输入属性标识'
        } else {
          e.virtualCodeError = false
        }
      }
      return e
    })
  }

  return {
    tableData,
    validateForm,
    isValidate,
    groupNameChange,
    groupNumberChange,
    virtualCodeChange,
  }
}
