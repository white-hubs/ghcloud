import _ from "lodash";
const module = function () {
  return {
    namespaced: true,
    state: {
      menu: null,
      app: null,
      tabsPane: [],
    },
    mutations: {
      SET_MENU: (state, value) => {
        state.tabsPane = [];
        state.menu = _.cloneDeep(value);
        sessionStorage.setItem("menu", value);
      },
      SET_APP: (state, value) => {
        state.tabsPane = [];
        state.app = _.cloneDeep(value);
        sessionStorage.setItem("app", value);
      },
      SET_TABS_PANE: (state, value) => {
        state.tabsPane = _.cloneDeep(value);
      },
    },
  };
};
export default module();
