import { defineStore } from 'pinia'

export const storeEnergy = defineStore('storeMarket', {
  state: () => {
    return {
      energyType: [{ text: '', value: '' }],
    }
  },
})
