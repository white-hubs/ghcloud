import { createStore } from "vuex";
import getters from "./getters";

// 使用 import.meta.glob 自动导入 modules 目录下的所有模块
const modulesFiles = import.meta.glob('./modules/**/*.js', { eager: true });

const modules = Object.keys(modulesFiles).reduce((modules, modulePath) => {
  // 从路径中提取模块名（例如：'./modules/user.js' -> 'user'）
  const moduleName = modulePath.replace(/^\.\/modules\/(.*)\.\w+$/, '$1');
  
  // 获取模块内容（Vite 的 eager 模式会立即导入）
  const value = modulesFiles[modulePath];
  
  // 确保有默认导出再添加到 modules
  if (value.default) {
    modules[moduleName] = value.default;
  }
  
  return modules;
}, {});

// 创建 Vuex store
export default createStore({
  getters,
  modules,
});