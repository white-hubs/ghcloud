import { storeCache } from '@/store/cache'
import type { DeptList } from '@ghcloud/cube-ouaa-service'
import { ref, type Ref } from 'vue'

interface UseDept {
  deptSelect: Ref<DeptList | undefined>;
  setDeptCache: (item: DeptList) => void;
}
export const useDept = (): UseDept => {
  const cacheStore = storeCache()
  const cacheDeptSelectKey = 'operating-dept-select'
  const deptSelect = ref<DeptList>(cacheStore.deptSelect)

  const setDeptCache = (item: DeptList): void => {
    deptSelect.value = item && Array.isArray(item) ? item[0] : item
    if (deptSelect.value) {
      cacheStore.deptSelect = deptSelect.value
      localStorage.setItem(cacheDeptSelectKey, JSON.stringify(deptSelect.value))
    }
  }
  return {
    deptSelect,
    setDeptCache
  }
}
