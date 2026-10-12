import type { HandoverFormState } from '@/types/todo-type'
import type { PersonItem } from '@ghcloud/cube-ouaa-service'
import type { HandoverRecordDetailVO, WorkTaskPageVO } from '@ghcloud/cube-work-center-service/src/type'
import { defineStore } from 'pinia'

interface StoreTodo {
  checkUsers: PersonItem[] | undefined;
  takeoverDetail: HandoverRecordDetailVO | undefined;
  handoverDetail: HandoverRecordDetailVO | undefined;
  checkItems: WorkTaskPageVO[] | undefined;
  handoverForm: HandoverFormState | undefined;
}

export const storeTodo = defineStore('storeTodo', {
  state: (): StoreTodo => {
    return {
      checkUsers: undefined,
      takeoverDetail: undefined,
      handoverDetail: undefined,
      checkItems: undefined,
      handoverForm: undefined,
    }
  },
  getters: {

  },
  actions: {

  },
  persist: true
})
