import Antd, { message } from "ant-design-vue";

import request from "@/utils/request";

import "@/styles/index.less";
// import './styles/antd-v2.css'
// import 'ant-design-vue/dist/antd.less';
// import 'ant-design-vue/dist/antd.variable.min.css';
import { Base64 } from "js-base64";
import _ from "lodash";
import { createPinia } from "pinia";
import { createApp } from "vue";

import { licenseCheck } from "@ghcloud/cube-app-design";
import { CubeDictionaryService } from "@ghcloud/cube-dictionary-service";
import { createGlobalStateForVue } from "@ghcloud/cube-mf-root";
import { loadCubeIconfont } from "@ghcloud/cube-ui";

import App from "./App.vue";
import { initGlobalState } from "./globalState";
import { useChildApplication } from "./hooks/use-child-application";
import { useSystemTitleStore } from "./hooks/use-system-title";
import interceptApiMessage from "./intercept-api-message.js";
import router from "./routes";

import "./styles/global.less";

interceptApiMessage();

const getProjectInfo = async () => {
  try {
    const res = await new CubeDictionaryService().getSysDictionaryByCodeAndItemCode({
      itemCode: "FRONTEND_CONFIG",
      code: "bimops-manage-web",
    });
    const localFeature = window.config?.feature || {};
    window.config = {
      ...(window.config || {}),
      ...JSON.parse(res.variable),
    };
    // 优先使用本地配置--苏州公安网登录
    window.config.feature = {
      ...(window.config.feature || {}),
      ...localFeature,
    };
  } catch (error) {
    // (function(){})('获取项目信息失败', error);
  } finally {
    if (window.name) {
      try {
        const injectConfig = JSON.parse(window.name) ?? [];
        for (const key in injectConfig) {
          const element = injectConfig[key];
          if (key === "microApps") {
            for (const microApp of element) {
              const microAppIndex = window.config.microApps.findIndex((e) => e.name === microApp.name);
              if (microAppIndex === -1) {
                window.config.microApps.push(microApp);
              } else {
                window.config.microApps[microAppIndex] = microApp;
              }
            }
          } else {
            window.config[key] = element;
          }
        }
      } catch (error) {}
      window.name = "";
    }
    if (window.config.systemName) {
      document.title = window.config.systemName;
    }
  }
};

const bootstrap = async () => {
  try {
    await loadCubeIconfont({
      cacheBust: import.meta.env.MODE !== "dev",
    });
  } catch (error) {
    console.warn("Cube Iconfont 加载失败", error);
  }
  await getProjectInfo();
  const app = createApp(App);
  const pinia = createPinia();

  app.use(pinia);
  createGlobalStateForVue(app);
  await initGlobalState();
  useSystemTitleStore().setSystemTitleFromConfig();
  app.use(Antd);
  app.use(router);
  app.use(Base64);
  app.mount("#app");
  app.config.globalProperties.$message = message;
  app.config.globalProperties.$request = request;
  app.config.globalProperties.$Base64 = Base64;

  const childApplication = useChildApplication();
  childApplication.registerChildApp();
  licenseCheck();
};
bootstrap();
