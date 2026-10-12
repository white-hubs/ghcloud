import type { AuthInfo, UserInfo } from '@/types'
import { defineStore } from 'pinia'

interface StoreUser {
  userInfo: UserInfo | null;
  authInfo: AuthInfo | null;
  avatarUrl: string | null;
}

export const storeUser = defineStore('storeUser', {
  state: (): StoreUser => {
    return {
      userInfo: null,
      authInfo: null,
      avatarUrl: null
    }
  },
  getters: {

  },
  persist: {
		storage: { 
			getItem: uni.getStorageSync,
			setItem: uni.setStorageSync
		},
	},
  actions: {
    clearUserInfo () {
      this.userInfo = null
    },
    clearAuthInfo () {
      this.authInfo = null
    },
  }
})
