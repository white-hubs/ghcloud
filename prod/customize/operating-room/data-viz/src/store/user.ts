import type { UserInfo } from '@ghcloud/cube-ouaa-service'
import { defineStore } from 'pinia'

interface StoreUser {
  userInfo: UserInfo | null;
  tenantInfo: { name: string;code: string; } | null;
}

export const storeUser = defineStore('storeUser', {
  state: (): StoreUser => {
    return {
      userInfo: null,
      tenantInfo: null,
    }
  },
  getters: {

  },
  actions: {

  },
})
