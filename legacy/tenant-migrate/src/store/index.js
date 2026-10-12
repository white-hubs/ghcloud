import { createStore } from "vuex";
import getters from "./getters";
import enterprise from './modules/enterprise'
import menu from './modules/menu'
import userInfo from './modules/userInfo'

// 调用createStore
export default createStore({
  getters,
  modules: {
    enterprise,
    menu,
    userInfo,
  },
});
