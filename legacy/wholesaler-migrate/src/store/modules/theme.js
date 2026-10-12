const namespace = 'theme';
const r = (ac) => `${namespace}/${ac}`;
export const moduleName = namespace;
export const SET_STATE = r('SET_STATE');

export const SET_SAVED_THEME = r('SET_SAVED_THEME');

export const GETTER_SAVED_THEME = r('GETTER_SAVED_THEME');

export const module = function () {
  return {
    state: {
      savedTheme: 'default',
    },
    getters: {
      [GETTER_SAVED_THEME]: (state) => state.savedTheme,
    },
    mutations: {
      [SET_SAVED_THEME](state, value) {
        state.savedTheme = value;
        localStorage.setItem('theme', value);
      },
    },
  };
};
export default module();
