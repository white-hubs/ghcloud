import _ from "lodash";

export default {
  namespaced: true,
  state: {
    // 设备订阅的实时数据变化
    realTimeData: [],
   
  },
  mutations: {
    SET_REALTIME_DATA: (state, value) => {
      state.realTimeData = _.cloneDeep(value);
    },

  },
};
