// import "ant-design-vue/dist/antd.css";
import App from "./App.vue";
import directives from "./directives/directives";
import "amfe-flexible";
import "./assets/font/index.css";
import router from "./router";
import Antd from "ant-design-vue";
import "./style.css";
import "./style/flex.less";
import "./style/antdReset.less";
import moment from "moment";
import "@/assets/deviceFonts/iconfont";
import "@/assets/deviceFonts/iconfont.css";
import { createPinia } from "pinia";
import { createApp } from "vue";
import "moment/locale/zh-cn";
moment.locale("zh-cn");
import { initGlobalState } from "./globalState";
import { ConfigLoader } from "./pages/config-loader";
import { licenseCheck } from "@ghcloud/cube-app-design";
import { createGlobalStateForVue } from "@ghcloud/cube-mf-root";

// 动态计算 scale 值
function calculateScale() {
  // 已知分辨率与 scale 的映射关系
  const resolutionScaleMap = [
    { width: 7680, height: 2160, scale: 0.5 },
    { width: 4800, height: 1890, scale: 1 },
    { width: 2800, height: 920, scale: 0.57, fontSizeScale: 1.5 },
    { width: 2550, height: 1440, scale: 1 },
    { width: 1920, height: 1080, scale: 1 },
  ];
  const screenWidth = window.innerWidth;
  const screenHeight = window.innerHeight;

  // 找到最接近的分辨率
  let closestMatch = resolutionScaleMap[0];
  let minDistance = Infinity;

  for (const resolution of resolutionScaleMap) {
    const distance = Math.sqrt(Math.pow(screenWidth - resolution.width, 2) + Math.pow(screenHeight - resolution.height, 2));
    if (distance < minDistance) {
      minDistance = distance;
      closestMatch = resolution;
    }
  }
  // 返回最接近的分辨率对应的 scale 值
  document.documentElement.style.setProperty("--scale", String(closestMatch.scale));
  document.documentElement.style.setProperty("--font-size-scale", String(closestMatch.fontSizeScale ?? 1));
}

window.addEventListener("resize", () => {
  calculateScale();
});
// 初始化设置
calculateScale();
async function bootstrap() {
  const app = createApp(App);
  const pinia = createPinia();
  app.use(pinia);
  //@ts-ignore
  createGlobalStateForVue(app);
  directives(app);
  app.use(Antd);
  await initGlobalState();
  licenseCheck();
  try {
    await ConfigLoader.loadConfig();
  } catch (error) {
  } finally {
    app.use(router);
    app.mount("#app");
  }
}

bootstrap();
