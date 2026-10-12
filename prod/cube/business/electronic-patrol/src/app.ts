import { createApp, type App } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import { routes } from './router'
import './style/common.less'
import {  initAuth } from './utils/permission'

type MenuConfig = { path: string;name: string;dataPermissions: { id: string; }[]; }[]

interface RenderProps {
  container?: Element | string;
  // base path，default：`/`
  base?: string;
  permissionConfig?: { menuConfig: MenuConfig; functionCodes: string[]; };

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
    const { default: component } = await import('./app.vue')
    const app = createApp(component)
    this.installRouter(app)
    this.mount(app)
    this.#app = app
  }

  public async uninstall (): Promise<void> {
    this.app.unmount()
  }

  private installRouter (app: App<Element>): void {
    const { base = '',permissionConfig } = this.props
    if (permissionConfig) {
      
      initAuth(permissionConfig.menuConfig)
      this.handleRouter(permissionConfig?.menuConfig, base)
      this.#functionCodes = permissionConfig?.functionCodes
    }
    const router = createRouter({
      history: createWebHistory(base),
      routes
    })
    app.use(router)
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

  private mount (app: App<Element>): void {
    // TODO(danke): 由于当前 qiankun 传下的 props.contaniner 内包含 qiankun-head 头，如果直接用 container 渲染会导致 qiankun-head 被覆盖（当中承载样式等信息）遂暂用 id 的方式绑定容器
    app.mount('#TemplateApp')
  }
}
