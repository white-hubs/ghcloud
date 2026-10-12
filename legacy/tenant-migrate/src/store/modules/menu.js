import _ from "lodash";
// import axios from '@/utils/axios';
const namespace = "menu";
const r = (ac) => `${namespace}/${ac}`;
export const moduleName = namespace;
export const SET_FIRST_MENU = r("SET_FIRST_MENU");
export const SET_TABS_PANE = r("SET_TABS_PANE");
export const module = function () {
  return {
    state: {
      firstMenu: null,
      tabsPane: [],
    },
    mutations: {
      [SET_FIRST_MENU](state, value) {
        state.tabsPane = [];
        state.firstMenu = _.cloneDeep(value);
        sessionStorage.setItem("firstMenu", value);
      },
      [SET_TABS_PANE](state, value) {
        state.tabsPane = _.cloneDeep(value);
      },
    },

    actions: {},
  };
};
export default module();
