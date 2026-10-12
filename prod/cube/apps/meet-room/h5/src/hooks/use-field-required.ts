import { cubeMeetRoomService } from '@/api/server'
import type { FieldConfigurationVO } from '@ghcloud/cube-meet-room-service'
import { ref, type Ref } from 'vue'

interface UseFieldRequired {
  fieldList: Ref<FieldConfigurationVO[]>;
  getFieldList: () => Promise<void>;
  checkFieldRequired: (fieldCode: string) => boolean;
  checkFieldHidden: (fieldCode: string) => boolean;
  isFieldConfigLoaded: Ref<boolean>;
  loadFieldConfig: () => Promise<void>;
}

export const useFieldRequired = (): UseFieldRequired => {
  const fieldList = ref<FieldConfigurationVO[]>([])
  const isFieldConfigLoaded = ref<boolean>(false)
  
  const getFieldList = async (): Promise<void> => {
    if (isFieldConfigLoaded.value) return
    
    try {
      const res = await cubeMeetRoomService.getRequiredFieldPage({
        pageSize: 100,
        pageNumber: 1
      })
      fieldList.value = res.records
      isFieldConfigLoaded.value = true
    } catch {
      isFieldConfigLoaded.value = true
    }
  }
  
  const loadFieldConfig = async (): Promise<void> => {
    await getFieldList()
  }
  
  const checkFieldHidden = (fieldCode: string): boolean => {
    if (!isFieldConfigLoaded.value || fieldList.value.length === 0) {
      return false // 默认显示
    }
    
    const field = fieldList.value.find((item: FieldConfigurationVO) => item.fieldCode === fieldCode)
    
    if (!field) {
      return false // 默认显示
    }
    
    return field.hidden === true
  }
  
  const checkFieldRequired = (fieldCode: string): boolean => {
    // 如果字段被隐藏，则不需要必填验证
    if (checkFieldHidden(fieldCode)) {
      return false
    }
    
    if (!isFieldConfigLoaded.value || fieldList.value.length === 0) {
      return true
    }
    
    const field = fieldList.value.find((item: FieldConfigurationVO) => item.fieldCode === fieldCode)
    if (field === undefined || field === null || JSON.stringify(field) === '{}' || !field){
      return true
    }
    return !!field.required
  }

  return {
    fieldList,
    getFieldList,
    checkFieldRequired,
    checkFieldHidden,
    isFieldConfigLoaded,
    loadFieldConfig
  }
}
