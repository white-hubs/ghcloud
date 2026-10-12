import _ from "lodash";

export default {
  namespaced: true,
  state: {
    commandDispatch: {
      verifyResult: false, //设备链接状态
      loginResult: false, //登录状态
    },
  },
  mutations: {
    SET_commandDispatch: (state, value) => {
      state.commandDispatch = _.cloneDeep(value);
    },
  },
};
