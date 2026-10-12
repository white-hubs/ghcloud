import Antd from "ant-design-vue";
// import "ant-design-vue/dist/antd.variable.min.css";
import App from "./App.vue";
import { constantRoutes } from "./router/routes";
import { useApproval } from "./store/index";
import * as directives from "@/directives";
import { createPinia } from "pinia";
import { qiankunWindow, renderWithQiankun } from "vite-plugin-qiankun/dist/helper";
import { Directive, createApp } from "vue";
import { createRouter, createWebHistory } from "vue-router";
import "./style/common.less";
// import "./style/modified.css";
import { initAuthStore } from "./api/auth-store";
import { initGenericComponentAuth } from "@ghcloud/generic-component";
let app: any = null;
let router = null;
// 挂载函数
function render(props: any) {
  const { container, base } = props;
  handleRouter((props.permissionConfig?.menuConfig as any[]) ?? [], base);
  router = createRouter({
    history: createWebHistory(base),
    routes: constantRoutes,
  });
  const pinia = createPinia();
  app = createApp(App);
  app.use(router);
  app.use(Antd);
  app.use(pinia);
  updateFunctionCodes(props.permissionConfig?.functionCodes as string[]);
  Object.keys(directives).forEach((key) => {
    app.directive(key, (directives as { [key: string]: Directive })[key]);
  });
  initAuthStore(props.auth);
  initGenericComponentAuth(props.auth);
  app.mount(container ? container.querySelector("#StreamEngineRenderApp") : "#StreamEngineRenderApp");
}
/**
 * 处理路由增加权限id
 * @param menuConfigs
 * @param base
 */
function handleRouter(menuConfigs: any[], base: string) {
  const microBase = base.slice(0, base.length - 1);
  const menusPath = menuConfigs.map((item) => item.path.replace(microBase, ""));
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
/**
 * 新增权限code
 * @param functionCodes
 */
function updateFunctionCodes(functionCodes: string[]) {
  const store = useApproval();
  store.updateFunctionCodes(functionCodes);
}

function storeTest(props: any) {
  props.onGlobalStateChange && props.onGlobalStateChange((value: any, prev: any) => {}, true);
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
    render({ base: "/portal/stream-engine-render", ...props });
    storeTest(props);
    // store.commit("updateUserInfo",props);
    // 在vue全局注册主应用的状态监听和状态改变事件
    app.config.globalProperties.$onGlobalStateChange = props.onGlobalStateChange;
    app.config.globalProperties.$setGlobalState = props.setGlobalState;
  },
  bootstrap() {},
  unmount() {
    app.unmount();
    router = null;
    app = null;
  },
  update() {},
});

if (!qiankunWindow.__POWERED_BY_QIANKUN__) {
  render({
    base: "",
  });
}
