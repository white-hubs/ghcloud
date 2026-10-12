import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { ControllerState } from '@/typings/gateway'

export const storeBatch = defineStore('storeBatch', {
  state: () => {
    // 通道-批量勾选的控制器
    const selectController = ref<{
      ids: string[],
      list: ControllerState[]
    }>({
      ids: [],
      list: []
    })

    return {
      selectController
    }
  },
  persist: true
})
