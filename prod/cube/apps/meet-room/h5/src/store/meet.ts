import type { AppointmentDetailsVo, ReservationFormState, ReservationInfo } from '@ghcloud/cube-meet-room-service'
import { defineStore } from 'pinia'

interface StoreMeet {
  reservationTime: AppointmentDetailsVo[] | null;
  reservationFormState: ReservationFormState;
  conferenceDetail: ReservationInfo | null;
  checkUsers: { id: string; name: string; }[] | undefined;
}

export const storeMeet = defineStore('storeMeet', {
  state: (): StoreMeet => {
    return {
      reservationTime: [],
      reservationFormState: {},
      conferenceDetail: null,
      checkUsers: undefined,
    }
  },
  getters: {

  },
  actions: {

  },
  persist: true
})
