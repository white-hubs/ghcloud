import type { CompanyVO } from '@ghcloud/cube-operating-room-service'
import { defineStore } from 'pinia'

interface StoreDetection {
  company: CompanyVO | null;
}
// 检测报告相关
export const storeDetection = defineStore('storeDetection', {
  state: (): StoreDetection => {
    return {
      company: null
    }
  },
  getters: {

  },
  actions: {
    setCompany (company: CompanyVO) {
      this.company = company
    }

  },
  persist: true
})
