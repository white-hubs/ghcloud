import { createApp, defineAsyncComponent } from "vue";
import App from "./App.vue";
import router from "./routes";
import store from "./store";
import Antd from "ant-design-vue";
// import "ant-design-vue/dist/antd.css";
import "@/styles/font.less";
import "@/styles/index.less";
import api from './api'
import { message } from "ant-design-vue";
import { registerMicroApps, start } from "qiankun";
import SlideVerify from "vue-monoplasty-slide-verify";
import { Base64 } from "js-base64";
import * as echarts from "echarts";
import { authStore } from "./config";
import { licenseCheck } from './components/license-check/license-check'

const components = import.meta.glob('./components/**/*.vue');
let app = null
const initApp = () => {
  if (app) {
    app.unmount()
  }
  app = createApp(App);
  for (const [key, value] of Object.entries(components)) {
    const name = key.slice(key.lastIndexOf('/') + 1, key.lastIndexOf('.'));
    app.component(name, defineAsyncComponent(value));
  }
  app.echarts = echarts;

  app.use(SlideVerify);
  app.config.globalProperties.$api = api;

  app.use(Antd);
  app.use(store);
  app.use(router);
  app.use(Base64);
  app.mount("#app");
  licenseCheck()
  app.config.globalProperties.$message = message;
  app.config.globalProperties.$Base64 = Base64;

  // 在主应用中注册微应用
  const microApps = window.config.microApps
    ? window.config.microApps.map((item) => {
      const base = `/portal/${item.name}/`
      return {
        name: item.name,
        entry: item.entry,
        container: "#subContainer",
        activeRule: base,
        props: {
          store,
          router,
          base,
        }
      };
    })
    : [];
  registerMicroApps(microApps, {
    // qiankun 生命周期钩子 - 微应用加载前
    beforeLoad: (app) => {
      app.props.auth = authStore
      return Promise.resolve();
    },
    // qiankun 生命周期钩子 - 微应用挂载后
    afterMount: (app) => {
      return Promise.resolve();
    },

  });
  start({
    prefetch: false,
  })
}

if (app) {
  app.unmount()
}
document.addEventListener('DOMContentLoaded', () => {
  initApp()
})
initApp()