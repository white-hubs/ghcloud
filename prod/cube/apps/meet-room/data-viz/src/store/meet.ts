import type { AppointmentDetailState, ReservationFormState } from '@ghcloud/cube-meet-room-service'
import { defineStore } from 'pinia'

interface StoreMeet {
  reservationFormState: ReservationFormState;
  conferenceDetail: AppointmentDetailState | null;
  meetList: unknown[];
}

export const storeMeet = defineStore('storeMeet', {
  state: (): StoreMeet => {
    return {
      reservationFormState: {},
      conferenceDetail: {},
      meetList: []
    }
  },
  getters: {

  },
  actions: {

  },
  persist: true
})
