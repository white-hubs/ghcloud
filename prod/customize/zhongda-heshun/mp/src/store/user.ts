import type { AuthInfo, MemberGroup, ScanCodeResult, UserInfo } from '@/types'
import { defineStore } from 'pinia'

interface StoreUser {
  memberGroup: MemberGroup | null;
  userInfo: UserInfo | null;
  authInfo: AuthInfo | null;
  avatarUrl: string | null;
  scanCodeResult: ScanCodeResult | null;

}

export const storeUser = defineStore('storeUser', {
  state: (): StoreUser => {
    return {
      memberGroup: null,
      userInfo: null,
      authInfo: null,
      avatarUrl: null,
      scanCodeResult: null
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
    clearMemberGroup () {
      this.memberGroup = null
    },
    clearScanCodeResult () {
      this.scanCodeResult = null
    },
  }
})
