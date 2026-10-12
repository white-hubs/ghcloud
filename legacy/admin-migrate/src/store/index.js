import { createStore } from "vuex";
import getters from "./getters";
import appList from './modules/appList'
import menu from './modules/menu'
import tenant from './modules/tenant'
import userInfo from './modules/userInfo'
//因为我把模块拆分了，但是我又不想每次都导入，就通过这个自动导入modules目录下的模块
// const modulesFiles = require.context("./modules", true, /\.js$/);
// const modules = modulesFiles.keys().reduce((modules, modulePath) => {
//   const moduleName = modulePath.replace(/^\.\/(.*)\.\w+$/, "$1");
//   const value = modulesFiles(modulePath);
//   modules[moduleName] = value.default;
//   return modules;
// }, {});
const modules={
  appList,
  menu,
  tenant,
  userInfo
}
// 调用createStore
export default createStore({
  getters,
  modules,
});
