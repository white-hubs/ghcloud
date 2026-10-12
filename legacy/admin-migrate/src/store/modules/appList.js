import _ from "lodash";
const module = function () {
  return {
    namespaced: true,
    state: {
      appList: null,
    },
    mutations: {
      SET_APPLIST: (state, value) => {
        const data = _.cloneDeep(value);
        state.appList = data
        sessionStorage.setItem("appList", data);
      },
    },
  };
};
export default module();
