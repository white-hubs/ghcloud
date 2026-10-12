import Vuex from 'vuex';
import Vue from 'vue';
Vue.use(Vuex);
// 动态引入module
let contexts = require.context('./modules', true);
let modules = {};
contexts.keys().forEach((key) => {
  let name = contexts(key).moduleName; // 把包路径名变成导出名
  let module = contexts(key).default;
  name && (modules[name] = module);
});

export default new Vuex.Store({
  modules,
  strict: process.env.NODE_ENV !== 'production',
});
