import { defineStore } from 'pinia'

export const storeMarket = defineStore('storeMarket', {
  state: () => {
    return {
      currentMarket: '',
      currentMarketName: '',
    }
  },
})
