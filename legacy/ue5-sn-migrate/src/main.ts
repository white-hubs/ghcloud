import App from "./App.vue";
import directives from "./directives/directives";
import "amfe-flexible";
import "./assets/font/index.css";
import router from "./router";
import Antd from "ant-design-vue";
import moment from "moment";
import "./style.css";
import "./style/flex.less";
import "./style/antdReset.less";
import { createPinia } from "pinia";
import "@/assets/deviceFonts/iconfont";
import "@/assets/deviceFonts/iconfont.css";
import piniaPluginPersistedstate from "pinia-plugin-persistedstate";
import { createApp } from "vue";
import "moment/locale/zh-cn";
moment.locale("zh-cn");
import { setToken, setNowEnterprise, getNowEnterprise, getToken, getAuthBySecret } from "./utils/auth";
import { CubeTerminalEnum } from "@ghcloud/cube-protocol";
import { initAuthStore } from "@ghcloud/cube-safety-supervision-app/src/api/auth-store";
import qs from "qs";

/**
 * 初始化config
 */
const initConfig = async () => {
  window.config.entry = "views-shengNong";
  window.__CUBE_AUTH_INFO__ = {
    token: "",
    tenant: "",
    terminal: CubeTerminalEnum.BUSINESS,
  };
  const params = window.location.search?.split("?")[1];
  if (!params) {
    return;
  }
  if (params.includes("access_token")) {
    // 链接获取鉴权信息
    setToken(qs.parse(params));
    setNowEnterprise(qs.parse(params).nowEnterprise as string);
  } else if (params.includes("cube-secret") && !getToken()) {
    //通过授权码获取鉴权信息
    const cubeSecret = qs.parse(params);
    try {
      await getAuthBySecret(cubeSecret["cube-secret"] as string);
    } catch (error) {
      sessionStorage.clear();
      window.location.href = "/apps-legacy/ue5";
    }
  }
  try {
    const tenantId = getNowEnterprise().code;
    window.config.modelPerspective = window.config.modelPerspective.filter((e) => e.tenant === tenantId);
    window.config.perspective = window.config.perspective.filter((e) => e.tenant === tenantId);
    window.config.connectLines = window.config.connectLines.filter((e) => e.tenant === tenantId);
    window.config.systemName = window.config.systemNameConfig.find((e) => e.tenant === tenantId)?.value ?? "数字孪生可视化平台";
  } catch (error) {}
};

async function bootstrap() {
  try {
    await initConfig();
    window.__CUBE_AUTH_INFO__ = {
      token: getToken().access_token,
      tenant: getNowEnterprise().code,
      terminal: CubeTerminalEnum.BUSINESS,
    };
    initAuthStore(window.__CUBE_AUTH_INFO__);
  } catch (error) {
  } finally {
    const app = createApp(App);
    directives(app);
    app.use(router);
    app.use(Antd);
    const pinia = createPinia();
    pinia.use(piniaPluginPersistedstate);
    app.use(pinia);
    app.mount("#app");
  }
}

bootstrap();
