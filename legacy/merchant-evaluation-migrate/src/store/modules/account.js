import _ from 'lodash';
import {
  loadCurrentUser,
  loadCurrentProject,
  loadProjects,
} from '@/services/AccountService';

const namespace = 'account';
const r = (ac) => `${namespace}/${ac}`;
export const moduleName = namespace;
export const SET_STATE = r('SET_STATE');
// getters
export const GETTER_USER = r('GETTER_USER');

export const GETTER_PROJECTS = r('GETTER_PROJECTS');

export const GETTER_PROJECT = r('GETTER_PROJECT');
// actions
export const LOAD_CURRENT_USER = r('LOAD_CURRENT_USER');

export const LOAD_CURRENT_PROJECT = r('LOAD_CURRENT_PROJECT');

export const LOAD_PROJECTS = r('LOAD_PROJECTS');

export const module = function () {
  return {
    state: {
      user: null,
      project: {id:'1323555902002921473'},
      projects: null,
      active: null,
      selectedCategoryIndex: 0,
    },
    getters: {
      [GETTER_USER]: (state) => _.cloneDeep(state.user),
      [GETTER_PROJECT]: (state) => _.cloneDeep(state.project),
      [GETTER_PROJECTS]: (state) => _.cloneDeep(state.projects),
    },
    mutations: {
      [SET_STATE](state, [key, value]) {
        state[key] = value;
      },
      SET_ACTIVE(state, data) {
        state.active = data;
      },
      SET_SELECTEDCATEGORY(state, data) {
        state.selectedCategoryIndex = data;
      },
    },
    actions: {
      async [LOAD_CURRENT_USER]({ commit }) {
        const user = await loadCurrentUser();
        commit(SET_STATE, ['user', user]);
        commit('theme/SET_SAVED_THEME', user.theme || 'default'); // 设置主题
      },
      async [LOAD_CURRENT_PROJECT]({ commit }) {
        const project = await loadCurrentProject();
        commit(SET_STATE, ['project', project]);
      },
      async [LOAD_PROJECTS]({ commit }) {
        const projects = await loadProjects();
        commit(SET_STATE, ['projects', projects]);
      },
    },
  };
};
export default module();
