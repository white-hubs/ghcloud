import _ from "lodash";
const module = function () {
  return {
    namespaced: true,
    state: {
      nowEnterprise: null,
    },
    mutations: {
      SET_NOW_ENTERPRISE: (state, value) => {
        state.nowEnterprise = _.cloneDeep(value);
        sessionStorage.setItem("nowEnterprise", value);
      },
    },
  };
};
export default module();
