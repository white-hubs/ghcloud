import { defineStore } from 'pinia'
interface Type {
  record: {
    depId?: string | null;
    staffId?: string | null;
    objId?: string | null;
    typeId?: string | null | undefined;
    taskId?: string | null;
    depName?: string | null;
  };
  params: {
    period?: string | null;
  };
  value: string;
  title: string;
}
export const storeArea = defineStore('storeArea', {
  state: (): Type => {
    return {
      record: {
        depId: '',
        staffId: ''
      },
      params: {
        period: '',
      },
      value: '',
      title: ''
    }
  },
  getters: {

  },
  actions: {

  }
})
