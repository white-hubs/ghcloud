import { type Ref, ref, onMounted } from 'vue'
import { cubeMeetRoomService } from '@/api/service'
import type { FieldConfigurationVO } from '@ghcloud/cube-meet-room-service'

interface UseFieldRequired {
  fieldList: Ref<FieldConfigurationVO[]>;
  checkFieldRequired: (fieldCode: string) => boolean;
  checkFieldHidden: (fieldCode: string) => boolean;
  isFieldConfigLoaded: Ref<boolean>;
  loadFieldConfig: () => Promise<void>;
}

export const useFieldRequired = (): UseFieldRequired => {
  const fieldList = ref<FieldConfigurationVO[]>([])
  const isFieldConfigLoaded = ref<boolean>(false)
  
  const getFieldConfig = async (): Promise<void> => {
    if (isFieldConfigLoaded.value) return
    
    try {
      const res = await cubeMeetRoomService.getRequiredFieldPage({
        pageSize: 100,
        pageNumber: 1
      })
      if (res) {
        const { records } = res
        fieldList.value = records

        // 测试数据
        // fieldList.value.push({
        //   fieldCode: 'participantIds',
        //   fieldName: '参会人员',
        //   required: false,
        //   hidden: true,
        // })

        isFieldConfigLoaded.value = true
      }
    } catch (error) {
      isFieldConfigLoaded.value = true
    }
  }
  
  const loadFieldConfig = async (): Promise<void> => {
    await getFieldConfig()
  }
  
  onMounted(async () => {
    await getFieldConfig()
  })
  
  const checkFieldRequired = (fieldCode: string): boolean => {
    // 如果字段被隐藏，则不需要必填验证
    if (checkFieldHidden(fieldCode)) {
      return false
    }
    
    if (!isFieldConfigLoaded.value || fieldList.value.length === 0) {
      return true
    }
    
    const field = fieldList.value.find((item: FieldConfigurationVO) => item.fieldCode === fieldCode)
    
    if (!field) {
      return true
    }
    
    return !!field.required
  }
  
  const checkFieldHidden = (fieldCode: string): boolean => {
    if (!isFieldConfigLoaded.value || fieldList.value.length === 0) {
      return false // 默认显示
    }
    
    const field = fieldList.value.find((item: FieldConfigurationVO) => item.fieldCode === fieldCode)
    
    if (!field) {
      return false // 默认显示
    }
    
    const isHidden = field.hidden === true
    return isHidden
  }

  return {
    fieldList,
    checkFieldRequired,
    checkFieldHidden,
    isFieldConfigLoaded,
    loadFieldConfig
  }
}
