import Antd from "ant-design-vue";
import "ant-design-vue/dist/antd.variable.min.css";
import {
  qiankunWindow,
  renderWithQiankun,
} from "vite-plugin-qiankun/dist/helper";
import { createApp } from "vue";
import { createRouter, createWebHistory } from "vue-router";
import App from "./App.vue";
import { constantRoutes } from "./router/routes";
import { setupStore } from "@/store/index";
import "./style/common.less";
let app: any = null;
let history = null;
let router = null;
// 挂载函数
function render(props: any) {
  const { container } = props;
  history = createWebHistory(
    qiankunWindow.__POWERED_BY_QIANKUN__
      ? "/portal/ConsumptionManagement/"
      : "/",
  );

  router = createRouter({
    history: createWebHistory("/portal/ConsumptionManagement/"),
    routes: constantRoutes,
  });
  app = createApp(App);
  app.use(router);
  app.use(Antd);
  setupStore(app);
  app.mount(
    container
      ? container.querySelector("#ConsumptionManagementApp")
      : "#ConsumptionManagementApp",
  );
}
function storeTest(props: any) {
  props.onGlobalStateChange &&
    props.onGlobalStateChange(
      (value: any, prev: any) =>
        void 0,
      true,
    );
  props.setGlobalState &&
    props.setGlobalState({
      ignore: props.name,
      user: {
        name: props.name,
      },
    });
}

renderWithQiankun({
  mount(props) {
    render(props);
    storeTest(props);
    // store.commit("updateUserInfo",props);
    // 在vue全局注册主应用的状态监听和状态改变事件
    app.config.globalProperties.$onGlobalStateChange =
      props.onGlobalStateChange;
    app.config.globalProperties.$setGlobalState = props.setGlobalState;
  },
  bootstrap() {
  },
  unmount() {
    app.unmount();
    router = null;
    app = null;
    history = null;
  },
  update() {
  },
});

if (!qiankunWindow.__POWERED_BY_QIANKUN__) {
  render({});
}
