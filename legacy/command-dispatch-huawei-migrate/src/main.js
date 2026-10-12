import { createFromIconfontCN } from "@ant-design/icons-vue";
import Antd, { message } from "ant-design-vue";
import { Base64 } from "js-base64";
import camelCase from "lodash/camelCase";
import upperFirst from "lodash/upperFirst";
import mitt from "mitt";
import { createApp } from "vue";

import App from "./App.vue";
import { dragDirectives } from "./directives/drag";
import router from "./routes";
import store from "./store";
import axios from "@/utils/axios";
import request from "@/utils/request";

import "@/styles/index.less";
import "ant-design-vue/dist/antd.css";

// 创建 IconFont 组件（iconfont 脚本已迁移至 resources）
const IconFont = createFromIconfontCN({
  // scriptUrl: '/resource/v1/command-dispatch-migrate/iconfont/iconfont.js'
  scriptUrl: () => import("@/assets/command-dispatch-iconFont.js"),
});

// 导入 echarts
import * as echarts from "echarts";

const app = createApp(App);

// 挂载 echarts 到全局
app.config.globalProperties.$echarts = echarts;

// 注册 IconFont 组件
app.component("IconFont", IconFont);

// 全局组件自动注册（使用 import.meta.glob）
window.commonComponent = {};
const components = import.meta.glob("./components/**/*.vue", { eager: true });

Object.entries(components).forEach(([path, component]) => {
  const componentConfig = component.default || component;
  const componentName = upperFirst(
    camelCase(
      path
        .split("/")
        .pop()
        .replace(/\.\w+$/, ""),
    ),
  );

  app.component(componentName, componentConfig);
  window.commonComponent[componentName] = componentConfig;
});

// 全局 API 自动注册
const api = {};
const apiModules = import.meta.glob("./api/**/*.js", { eager: true });

Object.values(apiModules).forEach((module) => {
  const apiObject = module.default || module;
  Object.keys(apiObject).forEach((key) => {
    if (Object.prototype.hasOwnProperty.call(apiObject, key)) {
      api[key] = apiObject[key];
    }
  });
});

// 挂载全局属性
app.config.globalProperties.$api = api;
app.use(Antd);
app.use(store);
app.use(router);
app.use(Base64);
app.use(dragDirectives);

// 事件总线
const emitter = mitt();
app.config.globalProperties.$emitter = emitter;
app.config.globalProperties.$message = message;
app.config.globalProperties.$restful = axios.restful;
app.config.globalProperties.$request = request;
app.config.globalProperties.$Base64 = Base64;

// 挂载应用
app.mount("#app");
