import _ from "lodash";
const module = function () {
  return {
    namespaced: true,
    state: {
      tenant: null,
    },
    mutations: {
      SET_TENANT: (state, value) => {
        state.tenant = _.cloneDeep(value);
        sessionStorage.setItem("tenant", value);
      },
    },
  };
};
export default module();
