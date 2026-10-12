import { type App, createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import routes from './routes'
import Antd, { message } from 'ant-design-vue'
import * as api from '@/api'
import { installComponent } from '@/components'
import store from './store'
import "@/styles/ant_design.less";
import "@/styles/index.less";
import { initAuthStore } from './api/auth-store.js'
import { genericAuthStore as initGenericComponentAuth } from '@ghcloud/generic-component/src/api/auth-store.ts'

interface RenderProps {
  container?: Element | string;
  base?: string;
  auth?:{ tenant: string; token: string; }
}

export class Application {
  #app?: App<Element>

  private get app (): App<Element> {
    if (!this.#app) {
      throw new Error('app not initialized!')
    }
    return this.#app
  }

  public constructor (private readonly props: RenderProps) {}

  public async install (): Promise<void> {
    const { default: component } = await import('./app.vue')
    const app = createApp(component);
    app.use(store);
    app.config.globalProperties.$api = api;
    app.use(Antd)
    installComponent(app)
    Object.assign(app.config.globalProperties.$message, message)
    this.installRouter(app)
    this.mount(app)
    this.#app = app
  }

  public async uninstall (): Promise<void> {
    this.app.unmount()
  }

  private installRouter (app: App<Element>): void {
    const { base = '',auth } = this.props
    auth && initAuthStore(auth)
    auth && initGenericComponentAuth(auth)
    const router = createRouter({
      history: createWebHistory(base),
      routes
    })
    app.use(router)
  }

  private mount (app: App<Element>): void {
    // TODO(danke): 由于当前 qiankun 传下的 props.contaniner 内包含 qiankun-head 头，如果直接用 container 渲染会导致 qiankun-head 被覆盖（当中承载样式等信息）遂暂用 id 的方式绑定容器
    app.mount(__CONTAINER_ID__)
  }
}
