import * as AntIcons from '@ant-design/icons-vue'
import { createApp, type App } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import { routes } from './router'
import './style/common.less'
interface RenderProps {
  container?: Element | string
  base?: string
}

export class Application {
  private readonly app?: App<Element>

  public constructor(private readonly props: RenderProps) { }

  public async install(): Promise<void> {
    const { default: component } = await import('./app.vue')
    const app = createApp(component)
    this.installRouter(app)
    this.mount(app)
    this.installIcons(app)
  }

  public async uninstall(): Promise<void> {
    this.app?.unmount()
  }

  private installRouter(app: App<Element>): void {
    const { base = '' } = this.props

    const router = createRouter({
      history: createWebHistory(base),
      routes
    })

    app.use(router)
  }

  private mount(app: App<Element>): void {
    app.mount('#Energy')
  }

  private installIcons(app: App<Element>): void {
    // 循环使用全部全部图标
    const antIcons: any = AntIcons
    Object.keys(antIcons).forEach(key => {
      app.component(key, antIcons[key])
    })
  }
}
