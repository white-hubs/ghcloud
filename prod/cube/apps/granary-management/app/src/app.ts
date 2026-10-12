import { createApp, type App } from 'vue'
import { createPinia } from 'pinia'
import { createRouter, createWebHistory, type Router } from 'vue-router'
import { registerHostMainRouter } from './api/auth-store'
import { registerSyncFullWindowQuery } from './router/sync-full-window-query.ts'
import { routes } from './router.ts'
import { mainStore } from './store/index.ts'

type MenuConfig = { path: string; name: string; dataPermissions: { id: string }[] }[]

interface RenderProps {
  container?: Element | string;
  base?: string;
  router?: Router;
  permissionConfig?: { menuConfig: MenuConfig; functionCodes: string[] };
}

export class Application {
  #app?: App<Element>
  #functionCodes: string[]

  private get app (): App<Element> {
    if (!this.#app) {
      throw new Error('app not initialized!')
    }
    return this.#app
  }

  public constructor (private readonly props: RenderProps) {
    this.#functionCodes = []
  }

  public async install (): Promise<void> {
    const { App: component } = await import('./app.tsx')
    const app = createApp(component)
    this.installRouter(app)
    this.updateFunctionCodes(app)
    this.mount(app)
    this.#app = app
  }

  public async uninstall (): Promise<void> {
    registerHostMainRouter(undefined)
    this.app.unmount()
  }

  private installRouter (app: App<Element>): void {
    const { base = '', permissionConfig } = this.props
    if (permissionConfig) {
      this.handleRouter(permissionConfig.menuConfig, base)
      this.#functionCodes = permissionConfig.functionCodes
    }
    const router = createRouter({
      history: createWebHistory(base),
      routes
    })
    registerSyncFullWindowQuery(router)
    app.use(router)
    registerHostMainRouter(this.props.router)
    app.config.globalProperties.mainRouter = this.props.router
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
          permission: menuPermissions ? menuPermissions.id : '',
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
    app.mount('#cube-granary-management-app')
  }
}
