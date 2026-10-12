import { createApp, type App, type Directive } from 'vue'
import { createRouter, createWebHistory, type Router } from 'vue-router'
import { routes } from './router/index.ts'
import * as directives from '@/directives'
import { mainStore } from './store/index.ts'
import { createPinia } from 'pinia'
type MenuConfig = { path: string;name: string;dataPermissions: { id: string; }[]; }[]
interface RenderProps {
  container?: Element | string;
  base?: string;
  router?: Router;
  permissionConfig?: { menuConfig: MenuConfig; functionCodes: string[]; };
}

export class Application {
  #app?: App<Element>
  #functionCodes: string[] = []

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
    this.updateFunctionCodes(app)
    this.installDirectives(app)
    this.mount(app)
    this.#app = app
  }

  public async uninstall (): Promise<void> {
    this.app.unmount()
  }

  private installRouter (app: App<Element>): void {
    const { base = '', permissionConfig } = this.props
    if (permissionConfig) {
      this.handleRouter(permissionConfig?.menuConfig, base)
      this.#functionCodes = permissionConfig?.functionCodes
    }
    const router = createRouter({
      history: createWebHistory(base),
      routes
    })
    app.use(router)
  }

  private installDirectives (app: App<Element>): void {
    Object.keys(directives).forEach(key => {
      app.directive(key, (directives as Record<string, Directive>)[key])
    })
  }

  private handleRouter (menuConfigs: MenuConfig, base: string): void {
    const microBase = base.slice(0, base.length - 1)
    const menusPath = menuConfigs.map((item) => {
      return item.path.replace(microBase, '')
    })
    routes.forEach((item) => {
      if (menusPath.includes(item.path)) {
        const pathIndex = menusPath.indexOf(item.path)
        const menuConfig = menuConfigs[pathIndex]
        const menuPermissions = menuConfig.dataPermissions[0]
        item.meta = {
          ...item.meta,
          permission: menuPermissions
            ? menuPermissions.id
            : '',
          title: menuConfig.name,
        }
      }
    })
  }

  private updateFunctionCodes (app: App<Element>): void {
    const pinia = createPinia()
    app.use(pinia)
    const store = mainStore()
    store.updateFunctionCodes(this.#functionCodes)
  }

  private mount (app: App<Element>): void {
    // TODO(danke): 由于当前 qiankun 传下的 props.contaniner 内包含 qiankun-head 头，如果直接用 container 渲染会导致 qiankun-head 被覆盖（当中承载样式等信息）遂暂用 id 的方式绑定容器
    app.mount('#cooling-water')
  }
}
