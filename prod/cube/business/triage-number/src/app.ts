import 'ant-design-vue/dist/antd.css'
import { createApp, type App } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import { routes } from './router/index.ts'
import Antd from 'ant-design-vue'

interface RenderProps {
  container?: Element | string;
  // base path，default：`/`
  base?: string;
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
    const { App: component } = await import('./app.tsx')
    const app = createApp(component)
    this.installRouter(app)
    this.installAntd(app)
    this.mount(app)
    this.#app = app
  }

  public async uninstall (): Promise<void> {
    this.app.unmount()
  }

  private installRouter (app: App<Element>): void {
    const { base = '' } = this.props
    const router = createRouter({
      history: createWebHistory(base),
      routes
    })
    app.use(router)
  }

  private installAntd (app: App<Element>): void {
    app.use(Antd)
  }

  private mount (app: App<Element>): void {
    // TODO(danke): 由于当前 qiankun 传下的 props.contaniner 内包含 qiankun-head 头，如果直接用 container 渲染会导致 qiankun-head 被覆盖（当中承载样式等信息）遂暂用 id 的方式绑定容器
    app.mount('#VisualConfigApp')
  }
}
