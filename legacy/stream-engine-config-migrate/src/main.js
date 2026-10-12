import Vue from 'vue'
import App from './App.vue'
import store from './store'
import ElementUI from "element-ui";
import "element-ui/lib/theme-chalk/index.css";
import "@/assets/global.css";
import "@/assets/iconfont/iconfont.css"
import Ellipsis from '@/components/common/Ellipsis'
import WDialog from '@/components/common/WDialog'
import Tip from '@/components/common/Tip'
import lodash from "lodash";
import VueRouter from 'vue-router'
import {renderWithQiankun, qiankunWindow} from 'vite-plugin-qiankun/dist/helper'

window._ = lodash
const routes = [
  {
    path: '/',
    redirect: '/flowform'
  },
  {
    path: "/flowform",
    name: "flowform",
    component: () => import("@/views/flowform/Index.vue"),
    meta: {title: '表单管理'}
  },
  {
    path: "/admin/design",
    name: "design",
    component: () => import("@/views/admin/FormProcessDesign.vue"),
    meta: {title: '表单流程设计'}
  },
  {
    path: "/admin/workOrderDesign",
    name: "workOrderDesign",
    component: () => import("@/views/admin/WorkOrderFormProcessDesign.vue"),
    meta: {title: '工单流程设计'}
  }
]
Array.prototype.remove = function (value) {
  let index = this.indexOf(value)
  if (index > -1) {
    this.splice(index, 1)
  }
  return index
}

//移除对象数组，匹配唯一key
Array.prototype.removeByKey = function (key, val) {
  let index = this.findIndex(value => value[key] === val)
  if (index > -1) {
    this.splice(index, 1)
  }
  return index
}

//对象数组转map
Array.prototype.toMap = function (key) {
  let map = new Map()
  this.forEach(v => map.set(v[key], v))
  return map
}

Vue.use(VueRouter);
Vue.use(ElementUI);
Vue.use(Ellipsis);
Vue.use(WDialog);
Vue.use(Tip);
Vue.config.productionTip = false
Vue.prototype.BASE_URL = 'http://' + (process.env.NODE_ENV === 'development-' ? "localhost" : "192.168.0.221");
Vue.prototype.$isNotEmpty = function (obj) {
  return (obj !== undefined && obj !== null && obj !== '' && obj !== 'null')
}
Vue.prototype.$getDefalut = function (obj, key, df) {
  return (obj === undefined || key === undefined || !this.$isNotEmpty(obj[key])) ? df : obj[key];
}
Vue.prototype.$deepCopy = function (obj) { return JSON.parse(JSON.stringify(obj)) }

const api = {}
const apiContext = import.meta.glob('./api/*.js', { eager: true })
for (const key in apiContext) {
  const module = apiContext[key];
  Object.keys(module).forEach(item => {
    module[item] && (api[item] = module[item])
  })
}
Vue.prototype.$api = api
const obj = {}
const componentsContext = import.meta.glob('./components/common/*.vue', { eager: true })
for (const key in componentsContext) {
  const module = componentsContext[key];
  const componentConfig = module.default
  obj[componentConfig.name] = componentConfig
  Vue.component(componentConfig.name, componentConfig)
}


let router = null;
let instance = null;
function render(props = {}) {
  router = new VueRouter({
    base: '/portal/flow-engine/',
    mode: 'history',
    routes
  })
  Vue.use(router);
  instance = new Vue({
    store,
    router,
    render: h => h(App),
  }).$mount('#LegacyStreamConfigApp')
}

renderWithQiankun({
  bootstrap: ()=>{},
  mount: (props)=>{ render(props) },
  unmount: ()=>{
    instance.$destroy()
    instance.$el.innerHTML = ''
    instance = null;
    router = null;
  },
  update: ()=>{}
})

if (!qiankunWindow.__POWERED_BY_QIANKUN__) {
  render()
}