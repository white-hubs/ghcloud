import Vue from 'vue'
import Vuex from 'vuex'
import getters from './getters'
// import app from './modules/app'
// import settings from './modules/settings'
import user from './modules/user'
// import system from './modules/system'

Vue.use(Vuex)

const store = new Vuex.Store({
  state: {
    nodeMap: new Map(),
    isEdit: null,
    selectedNode: {},
    selectFormItem: null,
    design: {},
    isPublicForm:false
  },
  mutations: {
    selectedNode(state, val) {
      state.selectedNode = val
    },
    loadForm(state, val) {
      state.design = val
    },
    setIsEdit(state, val) {
      state.isEdit = val
    },
    isPublicForm(state, val) {
      state.isPublicForm=val
    },
  },
  modules: {
    // app,
    // settings,
    // system,
    user
  },
  getters
})

export default store
