import { createApp, type App } from 'vue'
import { createRouter, createWebHistory, type Router } from 'vue-router'
import { routes } from './router'
import { createPinia } from 'pinia'
import { getDataDictionaryByItemPage } from './api/dictionary.ts'
import { functionDictionaryStore } from './store/function-dictionary.ts'

type MenuConfig = { path: string;name: string;dataPermissions: { id: string; }[]; }[]
interface RenderProps {
  container?: Element | string;
  base?: string;
  router?: Router;
  permissionConfig?: { menuConfig: MenuConfig; functionCodes: string[]; };
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
  }

  public async install (): Promise<void> {
    try {
      await getDataDictionaryByItemPage('APP_BUSINESS_CONFIG').then((res) => {
        const attendance = res.data.records.find((item: { code: string; })=>item.code === 'ATTENDANCE_MANAGEMENT_ABILITY')
        if (!attendance) {
          return
        }
        const abilityConfig = Object.keys(JSON.parse(attendance.variable)).map(key=>{
          return {
            code: key,
            name: JSON.parse(attendance.variable)[key].name,
            value: JSON.parse(attendance.variable)[key].value,
          }
        }).filter(item=>item.value === true)
        functionDictionaryStore.push(...abilityConfig)
      })
    } catch (error) {
    }
    const { App: component } = await import('./app.tsx')
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
    const { base = '', permissionConfig } = this.props
    if (permissionConfig) {
      this.handleRouter(permissionConfig?.menuConfig, base)
    }
    const router = createRouter({
      history: createWebHistory(base),
      routes
    })
    app.use(router)
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
        item.meta = {
          ...item.meta,
          title: menuConfig.name,
        }
      }
    })
  }

  private mount (app: App<Element>): void {
    // TODO(danke): 由于当前 qiankun 传下的 props.contaniner 内包含 qiankun-head 头，如果直接用 container 渲染会导致 qiankun-head 被覆盖（当中承载样式等信息）遂暂用 id 的方式绑定容器
    app.mount('#AttendanceApp')
  }
}
