import Antd from "ant-design-vue";
// import "ant-design-vue/dist/antd.variable.min.css";
import App from "./App.vue";
import "moment/locale/zh-cn";
import { constantRoutes } from "./router/routes";
import moment from "moment";
import { createPinia } from "pinia";
import { qiankunWindow, renderWithQiankun } from "vite-plugin-qiankun/dist/helper";
import { Directive, createApp } from "vue";
import "./style/common.less";
import { createRouter, createWebHistory } from "vue-router";
moment.locale("zh-cn");
import { initAuthStore } from "./api/auth-store";
import { initGenericComponentAuth } from "@ghcloud/generic-component";

let app: any = null;
let router = null;
// 挂载函数
function render(props: any) {
  const { container, base } = props;
  handleRouter(props.permissionConfig?.menuConfig as any[], base);
  const pinia = createPinia();
  // const store= mainStore();
  router = createRouter({
    history: createWebHistory(base),
    routes: constantRoutes,
  });
  app = createApp(App);
  app.use(router);
  app.use(Antd);
  // app.use(store);
  app.config.globalProperties.mainRouter = props.router;
  app.mount(container ? container.querySelector("#governmentManagement") : "#governmentManagement");
  app.use(pinia);
}
function handleRouter(menuConfigs: any[], base: string) {
  const microBase = base.slice(0, base.length - 1);
  const menusPath = menuConfigs.map((item) => {
    return item.path.replace(microBase, "");
  });
  constantRoutes.forEach((item: any) => {
    if (menusPath.includes(item.path)) {
      const pathIndex = menusPath.indexOf(item.path);
      const menuConfig = menuConfigs[pathIndex];
      const menuPermissions = menuConfig.dataPermissions[0];
      item.meta = {
        ...item.meta,
        permission: menuPermissions ? menuPermissions.id : "",
        title: menuConfig.name,
      };
    }
  });
}
function storeTest(props: any) {
  props.onGlobalStateChange &&
    props.onGlobalStateChange((value: any, prev: any) => void 0, true);
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
    render({ base: "/portal/governmentManagement/", ...props });
    storeTest(props);
    initAuthStore(props.auth);
    initGenericComponentAuth(props.auth);
    // store.commit("updateUserInfo",props);
    // 在vue全局注册主应用的状态监听和状态改变事件
    app.config.globalProperties.$onGlobalStateChange = props.onGlobalStateChange;
    app.config.globalProperties.$setGlobalState = props.setGlobalState;
  },
  bootstrap() {
  },
  unmount() {
    app.unmount();
    router = null;
    app = null;
  },
  update() {
  },
});

if (!qiankunWindow.__POWERED_BY_QIANKUN__) {
  render({});
}
