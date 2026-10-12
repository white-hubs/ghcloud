import { createApp, type App } from 'vue'
import { createRouter, createWebHistory, type Router } from 'vue-router'
import { routes } from './router'
import { initAuthStore } from './api/auth-store.ts'
import 'amfe-flexible'
import 'animate.css'
import { CubeAuthService } from '@ghcloud/cube-auth-service'
import { CubeTerminalEnum } from '@ghcloud/cube-protocol'
import { initCubePlayerAuth } from '@ghcloud/cube-player'

interface RenderProps {
  container?: Element | string;
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
      history: createWebHistory(base),
      routes
    })
    app.use(router)
  }

  private mount (app: App<Element>): void {
    app.mount('#slide-rail-data-viz')
  }

  private async clientAuth (): Promise<void> {
    const authInfo = {
      token: '',
      tenant: '',
      terminal: 'bimops-manage-web'
    }
    const clientId = (import.meta as unknown as { env: { VITE_CLIENT_ID: string; }; }).env.VITE_CLIENT_ID ?? ''
    const clientSecret = (import.meta as unknown as { env: { VITE_CLIENT_SECRET: string; }; }).env.VITE_CLIENT_SECRET ?? ''
    if (!clientId || !clientSecret) {
      return
    }
    const cubeAuthService = new CubeAuthService(CubeTerminalEnum.BUSINESS)
    const authRes = await cubeAuthService.clientAuth(clientId, clientSecret)
    authInfo.tenant = authRes.tenant ?? '17490811'
    authInfo.token = authRes.accessToken
    initAuthStore(authInfo)
    initCubePlayerAuth(authInfo)
  }
}
