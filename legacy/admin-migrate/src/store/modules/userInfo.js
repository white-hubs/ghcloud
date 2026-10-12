import _ from "lodash";
const module = function () {
  return {
    namespaced: true,
    state: {
      userInfo: null,
    },
    mutations: {
      SET_USER_INFO: (state, value) => {
        state.userInfo = _.cloneDeep(value);
        sessionStorage.setItem("userInfo", value);
      },
      // SET_TABS_PANE: (state, value) => {
      //   state.tabsPane = _.cloneDeep(value);
      // },
    },
  };
};
export default module();
