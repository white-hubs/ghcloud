import { createApp, type App } from 'vue'
import { createMemoryHistory, createRouter, type Router } from 'vue-router'
import { routes } from '@/routers'
import { setupStore } from '@/store'
import 'amfe-flexible'
import { CubeAuthService } from '@ghcloud/cube-auth-service'
import { CubeTerminalEnum } from '@ghcloud/cube-protocol'
import { authStore } from './plugin/map-plugin.ts'
import './reset-leaflet-style.css'

interface RenderProps {
  container?: Element | string;
  // base path，default：`/`
  base?: string;
  router?: Router;
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
    await this.clientAuth()
    this.mount(app)
    this.#app = app
  }

  public async uninstall (): Promise<void> {
    this.app.unmount()
  }

  private installRouter (app: App<Element>): void {
    const { base = '' } = this.props
    const router = createRouter({
      history: createMemoryHistory(base ?? ''),
      routes
    })
    app.use(router)
    setupStore(app)
  }

  private mount (app: App<Element>): void {
    app.mount('#electronic-guide-client')
  }

  private async clientAuth (): Promise<void> {
    const clientId = (import.meta as unknown as { env: { VITE_CLIENT_ID: string; }; }).env.VITE_CLIENT_ID ?? ''
    const clientSecret = (import.meta as unknown as { env: { VITE_CLIENT_SECRET: string; }; }).env.VITE_CLIENT_SECRET ?? ''
    if (!clientId || !clientSecret) {
      return
    }
    const cubeAuthService = new CubeAuthService(CubeTerminalEnum.BUSINESS)
    const authRes = await cubeAuthService.clientAuth(clientId, clientSecret)
    authStore.tenant = authRes.tenant
    authStore.token = authRes.accessToken
  }
}
