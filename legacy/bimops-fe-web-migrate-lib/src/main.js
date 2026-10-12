import store from './store'
import { createApp, defineComponent, h } from 'vue'
import App from './app.vue'
import api from './api'
import mitt from 'mitt'
import MyGlobalCom from "./components/global/Common/index"
import moment from 'moment'
import 'moment/dist/locale/zh-cn'

moment.locale('zh-cn')

export function createLegacyApp() {
  const app = createApp(defineComponent({
    render: () => {
      return h(App, null)
    }
  }));
  app.use(store);
  app.config.globalProperties.$api = api;
  app.config.globalProperties.$emitter = mitt();
  app.use(MyGlobalCom)
  return app;
}