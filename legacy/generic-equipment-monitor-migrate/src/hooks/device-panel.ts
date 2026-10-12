import { ref } from 'vue'
const selectedDeviceModelAttr = ref([])
const activeModelTypeId = ref('')
export function usePanelConfigAttr() {
  const setActiveModelTypeId = (data: any) => {
    activeModelTypeId.value = data
  }
  const setSelectedDeviceModelAttr = (data: any) => {
    selectedDeviceModelAttr.value = data
  }
  return { 
    activeModelTypeId,
    selectedDeviceModelAttr,
    setActiveModelTypeId,
    setSelectedDeviceModelAttr
  }
}
