import { defineStore } from "pinia";
export const storeModelServer = defineStore("storeModelServer", {
  state: () => {
    return {
      serviceMode: "bs",
    };
  },
  getters: {},
  actions: {},
});
