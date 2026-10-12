import { createApp, type App } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import { routes } from './router'
import './style/common.less'
import 'uno.css'
import { createPinia } from 'pinia'
interface RenderProps {
  container?: Element | string;
  // base path，default：`/`
  base?: string;
  permissionConfig?:{
    functionCodes: string[],
    menuConfig: any
  }
}

export class Application {
  #app?: App<Element>

  private get app (): App<Element> {
    if (!this.#app) {
      throw new Error('app not initialized!')
    }
    return this.#app
  }

  public constructor (private readonly props: RenderProps) {
    this.handleRouter(props.permissionConfig?.menuConfig as any[],props.base as string)
  }

  public async install (): Promise<void> {
    const { default: component } = await import('./app.vue')
    const app = createApp(component)
    const pinia = createPinia()
    app.use(pinia)
    this.installRouter(app)
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
  public handleRouter(menuConfigs: any[], base: string) {
    const microBase = base.slice(0, base.length - 1);
    const menusPath = menuConfigs.map((item) => {
      return item.path.replace(microBase, "");
    });
    routes.forEach((item: any) => {
      if (menusPath.includes(item.path)) {
        const pathIndex = menusPath.indexOf(item.path);
        const menuConfig = menuConfigs[pathIndex];
        const menuPermissions =menuConfig.dataPermissions? menuConfig.dataPermissions[0]:{id:""};
        item.meta = {
          ...item.meta,
          permission: menuPermissions
            ? menuPermissions.id
            : "",
          title: menuConfig.name,
        };
      }
    });
}
  private mount (app: App<Element>): void {
    // TODO(danke): 由于当前 qiankun 传下的 props.contaniner 内包含 qiankun-head 头，如果直接用 container 渲染会导致 qiankun-head 被覆盖（当中承载样式等信息）遂暂用 id 的方式绑定容器
    app.mount('#LegacyAssetManagementApp')
  }
}
