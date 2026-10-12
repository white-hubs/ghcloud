import { defineStore } from "pinia";
export const useSubscribeStore = defineStore("deviceSubscribe", {
  state: () => {
    return {
      subscribeData: [],
    };
  },
  getters: {},
  actions: {},
});
