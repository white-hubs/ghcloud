const namespace = 'common';
const r = (ac) => `${namespace}/${ac}`;
export const moduleName = namespace;
export const SET_STATE = r('SET_STATE');

export const GETTER_DEVICE_SIZE = r('GETTER_DEVICE_SIZE');
export const GETTER_HIDDEN_FRAME = r('GETTER_HIDDEN_FRAME');

export const module = function () {
  return {
    state: {
      deviceSize: 'xxl',
      hiddenFrame: false,
    },
    getters: {
      [GETTER_DEVICE_SIZE]: (state) => state.deviceSize,
      [GETTER_HIDDEN_FRAME]: (state) => state.hiddenFrame,
    },
    mutations: {
      [SET_STATE](state, [key, value]) {
        state[key] = value;
      },
    },
  };
};
export default module();
