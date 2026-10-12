import { ParkingInfoVO } from '@ghcloud/cube-parking-lot-service/src/type'
import { defineStore } from 'pinia'

interface ParkingState {
  currentParking: ParkingInfoVO | null;
  parkingList: ParkingInfoVO[];
}

export const parkingStore = defineStore('parking', {
  state: (): ParkingState => {
    return {
      currentParking: null,
      parkingList:[]
    }
  },
  getters: {

  },
  actions: {

    updateCurrentParking (project: ParkingInfoVO) {
      this.currentParking = project
    },
    updateAllParkings (parkingList: ParkingInfoVO[]) {
      this.parkingList = parkingList
    },  
    clearCurrentParking () {
      this.currentParking = null
    },

  }
})