import { defineStore } from "pinia";
export const storeMenu = defineStore("storeArea", {
  state: () => {
    return {
      currentMenu: "",
      sort: 1,
      currentMenuName: "",
      scenarioTypes: [],
    };
  },
  getters: {},
  actions: {},
});
