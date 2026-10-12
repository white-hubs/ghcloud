import type { ReplicableTargetVO } from '@ghcloud/cube-maintain-service'
import { defineStore } from 'pinia'

interface StoreInspect {
  checkedList: ReplicableTargetVO[] | null;
  checkedIds: number[] | null;
  copyChecked: string;
}

export const storeInspect = defineStore('storeInspect', {
  state: (): StoreInspect => {
    return {
      checkedIds: null,
      checkedList: null,
      copyChecked: ''
    }
  },
  getters: {

  },
  actions: {
    resetCache () {
      this.checkedIds = null
      this.checkedList = null
      this.copyChecked = ''
    },
  },
  persist: true
})
