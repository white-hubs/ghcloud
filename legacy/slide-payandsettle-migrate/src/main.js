import './public-path';
import { createApp } from 'vue';
import { createRouter, createWebHistory } from 'vue-router';
import App from './App.vue';
import routes from './router';
import store from './store';

import Antd from "ant-design-vue";
import "ant-design-vue/dist/reset.css";
import "@/styles/index.less";
import upperFirst from "lodash/upperFirst";
import camelCase from "lodash/camelCase";
import { message } from "ant-design-vue";


let router = null;
let instance = null;
let history = null;


function render(props = {}) {
  const { container } = props;
  history = createWebHistory(window.__POWERED_BY_QIANKUN__ ? '/portal/payAndSettle/' : '/');
  router = createRouter({
    history,
    routes,
  });

  instance = createApp(App);
  instance.use(router);
  instance.use(store);
  instance.use(Antd);
  
  const requireComponent = require.context(
    // 其组件目录的相对路径
    "./components",
    // 是否查询其子目录
    true,
    // 匹配基础组件文件名的正则表达式
    /\.(vue)$/
  );
  requireComponent.keys().forEach((fileName) => {
    // 获取组件配置
    const componentConfig = requireComponent(fileName);
    // 获取组件的 PascalCase 命名
    const componentName = upperFirst(
      camelCase(
        // 获取和目录深度无关的文件名
        fileName
          .split("/")
          .pop()
          .replace(/\.\w+$/, "")
      )
    );
    // 全局注册组件
    instance.component(
      componentName,
      // 如果这个组件选项是通过 `export default` 导出的，
      // 那么就会优先使用 `.default`，
      // 否则回退到使用模块的根。
      componentConfig.default || componentConfig
    );
  });
  if (window.__POWERED_BY_QIANKUN__) {
    Object.keys(window.commonComponent).forEach((item)=>{
       // 全局注册组件
       instance.component(
        item,
        // 如果这个组件选项是通过 `export default` 导出的，
        // 那么就会优先使用 `.default`，
        // 否则回退到使用模块的根。
        window.commonComponent[item]
      );
    })
  }
  // 全局注册请求接口变量
    const api = {};
    const apiContext = require.context("./api", true, /.js$/);
    apiContext.keys().forEach((component) => {
      const object = apiContext(component);
      for (const key in object) {
        if (Object.prototype.hasOwnProperty.call(object, key)) {
          const element = object[key];
          api[key] = element;
        }
      }
    });

    instance.config.globalProperties.$message = message;
    instance.config.globalProperties.$api = api;

  instance.mount(container ? container.querySelector('#payAndSettleApp') : '#payAndSettleApp');
}

if (!window.__POWERED_BY_QIANKUN__) {
  render();
}

export async function bootstrap() {
}

function storeTest(props) {
  props.onGlobalStateChange &&
    props.onGlobalStateChange(
      (value, prev) => void 0,
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

export async function mount(props) {
  storeTest(props);
  render(props);
  instance.config.globalProperties.$onGlobalStateChange = props.onGlobalStateChange;
  instance.config.globalProperties.$setGlobalState = props.setGlobalState;
}

export async function unmount() {
  instance.unmount();
  instance._container.innerHTML = '';
  instance = null;
  router = null;
  history.destroy();
}
