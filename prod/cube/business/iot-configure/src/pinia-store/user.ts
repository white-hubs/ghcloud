import { defineStore } from 'pinia'
import { ref } from 'vue'
export const storeUser = defineStore('storeUser', {
  state: () => {
    const userInfo = ref<{
      admin: boolean;
      userName: string;
      token: string;
      tenant: string;
    }>({
      admin: true,
      userName: '',
      token: '',
      tenant: '',
    })
    return {
      userInfo
    }
  },
  persist: true
})
