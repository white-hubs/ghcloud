import { message } from '@ghcloud/cube-ui'
import { ref, type Ref } from 'vue'

interface UseBatchDelete {
  deleteLoading: Ref<boolean>;
  progress: Ref<number>; // 进度百分比
  removeNum: Ref<number>; // 进度数量
  deleteStatus: Ref<'success' | 'error' | undefined>;
  batchDelete: (payload: {
    deleteKeys: string[]; // 删除的数据ids
    size: 50; // 分批删除的数量
    deleteDataFunc: (ids: string[]) => Promise<unknown>; // 分批删除的函数
  }) => void;
}
export interface Row {
  id: string;
}
export const useBatchDelete = (): UseBatchDelete => {
  const deleteLoading = ref(false)
  const progress = ref(0)
  const removeNum = ref(0)
  const deleteStatus = ref<'success' | 'error' | undefined>()
  const getBatch = (array: unknown[], startIndex: number, size: number): unknown[] => {
    const endIndex = startIndex + size
    return array.slice(startIndex, endIndex)
  }
  const batchDelete = async (
    payload: {
      deleteKeys: string[];
      size: 50;
      deleteDataFunc: (ids: string[]) => Promise<unknown>;
    }
  ): Promise<void> => {
    try {
      deleteLoading.value = true
      progress.value = 0
      removeNum.value = 0
      let startIndex = 0
      while (startIndex < payload.deleteKeys.length) {
        try {
          const batch = getBatch(payload.deleteKeys, startIndex, payload.size)
          removeNum.value += batch.length
          await payload.deleteDataFunc(batch as string[])
          startIndex += payload.size
          progress.value = +(removeNum.value / payload.deleteKeys.length).toFixed(2)
        } catch {
          deleteStatus.value = 'error'
          break
        }
      }
      deleteStatus.value = 'success'
    } catch {
      deleteLoading.value = false
      deleteStatus.value = 'error'
    } finally {
      deleteLoading.value = false
    }
  }
  return {
    deleteLoading,
    progress,
    removeNum,
    deleteStatus,
    batchDelete
  }
}
