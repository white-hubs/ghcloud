import "@/assets/icons/index";
import "@/styles/index.less";
import axios from "@/utils/axios";
import { getParams } from "@/utils/common";
import request from "@/utils/request";
import { createFromIconfontCN } from "@ant-design/icons-vue";
import Antd, { message } from "ant-design-vue";
// import "ant-design-vue/dist/antd.less";
import camelCase from "lodash/camelCase";
import upperFirst from "lodash/upperFirst";
import { createApp } from "vue";
import App from "./App.vue";
import router from "./routes";
import store from "./store";
const IconFont = createFromIconfontCN({
  scriptUrl: "https://at.alicdn.com/t/font_3380753_l29npi1i10j.js",
});

import * as echarts from "echarts";
import { registerMicroApps } from "qiankun";
const app = createApp(App);
app.echarts = echarts;
app.component(
  "IconFont",
  // 如果这个组件选项是通过 `export default` 导出的，
  // 那么就会优先使用 `.default`，
  // 否则回退到使用模块的根。
  IconFont
);

window.commonComponent = {};
const components = import.meta.glob("./components/**/*.vue", { eager: true });
Object.entries(components).forEach(([filePath, component]) => {
  const componentConfig = component.default || component;
  const componentName = upperFirst(
    camelCase(filePath.split("/").pop().replace(/\.\w+$/, "")),
  );
  app.component(componentName, componentConfig);
  window.commonComponent[componentName] = componentConfig;
});

// 全局注册请求接口变量
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
app.config.globalProperties.$api = api;

import { Base64 } from "js-base64";
import mitt from "mitt";

app.use(Antd);
app.use(store);
app.use(router);
app.use(Base64);
app.mount("#app");
const emitter = mitt();
app.config.globalProperties.$emitter = emitter;
app.config.globalProperties.$message = message;
app.config.globalProperties.$restful = axios.restful;
app.config.globalProperties.$request = request;
app.config.globalProperties.$Base64 = Base64;
window.$goPage = app.config.globalProperties.$goPage = (path) => {
  if (path.indexOf("?") > -1) {
    sessionStorage.setItem("transitionPageTo", path);
    sessionStorage.setItem(
      "transitionPageFrom",
      router.options.history.location
    );
    router.push({
      path: "/transitionPage",
      query: getParams(path),
    });
  } else {
    api.getRoleMenusByPath({ path: path.split("?")[0] }).then((res) => {
      if (res.id) {
        store.commit("menu/SET_APPLICATION", res);
        api
          .getApplicationInMenus({ applicationCode: res.code }, "get")
          .then((res2) => {
            if (res2 && res2.length) {
              store.commit("menu/SET_MENU", res2);
              router.replace({
                path: path,
              });
            } else if (!res2.length) {
              proxy.$message.error("该应用下未分配菜单");
            }
          });
      } else {
        message.warn("无权限");
      }
    });
  }
};

const microApps = window.config.microApps
  ? window.config.microApps.map((item) => {
      return {
        name: item.name,
        entry: item.entry,
        container: "#appContainer",
        activeRule: `/portal/${item.name}/`,
        // props: { data: { store, router } },
        props:{
          store,
          router
        }
      };
    })
  : [];
registerMicroApps(microApps, {
  beforeLoad: (app) => void 0,
});

// export default {
//   install: (app, options) => {
//     app.config.globalProperties.$api = api;
//     app.config.globalProperties.$message = message;
//     app.config.globalProperties.$restful = axios.restful;
//     app.config.globalProperties.$request = request;
//     app.config.globalProperties.$Base64 = Base64;
//   }
// }
