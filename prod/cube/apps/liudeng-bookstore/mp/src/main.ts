import { createSSRApp } from "vue";
import { createPinia } from 'pinia';
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';
import Application from "./app.vue";
import '@/static/iconfont/iconfont.css'
export function createApp() {
  const app = createSSRApp(Application);
  const pinia = createPinia();
  pinia.use(piniaPluginPersistedstate);
  app.use(pinia);
  return {
    app,
  };
}
