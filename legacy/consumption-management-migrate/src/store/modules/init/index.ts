import { defineStore } from "pinia";

export const useInit = defineStore("form-store", {
  state: () => ({
    statusList: [],
  }),
  getters: {
    status(): any {
      return this.statusList;
    },
  },
  actions: {
    getStatusList(data: any) {

      this.statusList = data;
    },
  },
});
