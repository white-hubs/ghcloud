import { createApp, type App } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import { routes } from './router/index.ts'

interface RenderProps {
  container?: Element | string;
  base?: string;
}

export class Application {
  #app?: App<Element>

  public constructor (private readonly props: RenderProps) {}

  public async install (): Promise<void> {
    const { App: component } = await import('./app.tsx')
    const app = createApp(component)
    const router = createRouter({
      history: createWebHistory(this.props.base ?? ''),
      routes,
    })
    app.use(router)
    app.mount('#safety-personnel-management')
    this.#app = app
  }

  public async uninstall (): Promise<void> {
    this.#app?.unmount()
  }
}
