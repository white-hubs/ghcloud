import './public-path'
import Vue from 'vue'
import App from './App.vue'
import routes from './router/index.js'
import VueRouter from 'vue-router'
import Antd from 'ant-design-vue';
import store from './store';
import 'ant-design-vue/dist/antd.less';
import eventBus from './plugins/event_bus'
// import './styles/index.less'
import axios from '@/utils/axios';
import globalComponents from '@/components/global';
import MultiTab from './plugins/multi_tabs';
import Extionsion from './plugins/extension';
// 全局components中global的index文件导出了自定义全局组件（对象导出）。循环注册全局组件以便多页面使用
Object.keys(globalComponents).forEach((key) => {
  Vue.component(key, globalComponents[key]);
});

Vue.config.productionTip = false
Vue.prototype.$axios = axios;
Vue.prototype.$restful = axios.restful;



let router = null;
let instance = null;


function render(props = {}) {
  const { container } = props;
  router = new VueRouter({
    base: window.__POWERED_BY_QIANKUN__ ? '/portal/merchant-evaluation/' : '/',
    mode: 'history',
    routes
  })
  Vue.use(Antd);
  Vue.use(router);
  Vue.use(eventBus);
  Vue.use(MultiTab);
  Vue.use(Extionsion)
  instance = new Vue({
    router,
    store,
    render: h => h(App),
  }).$mount(container ? container.querySelector('#vue2App') : '#vue2App')
}

if (!window.__POWERED_BY_QIANKUN__) {
  render();
}

export async function bootstrap() {
}

export async function mount(props) {
  render(props);
}

export async function unmount() {
  instance.$destroy()
  instance.$el.innerHTML = ''
  instance = null
  router = null
}
