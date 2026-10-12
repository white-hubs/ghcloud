import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useSystemName = defineStore('systemNameStore',()=>{
  const systemName = ref(localStorage.getItem('system-alias-name') || (window.config.systemName ? window.config.systemName : ''))
  return {
    systemName
  }
})