import { createApp, type App } from 'vue'
import { createRouter, createWebHashHistory } from 'vue-router'
import { routes } from './router/index.ts'
import { getAuthInfo } from '@ghcloud/cube-auth-utils'
import { initAuthStore } from './api/auth-store.ts'
import { initAuthStore as genericAuthStore } from '@ghcloud/cube-app-generic-component'
import { getUrlParams } from './utils/index.ts'
import { getEnvironment } from '@ghcloud/cube-app-js-sdk/src/js/cube-h5-config.ts'
interface RenderProps {
  container?: Element | string;
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
    // 处理鉴权信息
    await this.handleAuthStore()
    this.setCurrentSesstion()
    const { App: component } = await import('./app.tsx')
    const app = createApp(component)
    this.installRouter(app)
    this.mount(app)
    this.#app = app
  }

  private async handleAuthStore (): Promise<void> {
    const env = (import.meta as unknown as { env: { MODE: string; }; }).env.MODE
    const runingEnvironment = getEnvironment()
    let authInfo = {
      token: '',
      tenant: '',
      terminal: 'bimops-manage-app'
    }
    // 方便开发时自定义token
    if (env === 'dev' && runingEnvironment !== 'cubeApp') {
      authInfo.token = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0ZW5hbnRzIjpbIjU4MTk3MjYwIiwiNTk5OTYwNTIiLCIxODMyMTYwMiIsIjgyOTcwMTQwIiwiNjIyMjA4OTciLCI0NjI0MjcyOCIsIjQ3NTc4MTYxIiwiNjA1MTYyNjgiLCI1NTc2NDM1Il0sInBhc3N3b3JkX2V4cGlyZWQiOmZhbHNlLCJ1c2VyX25hbWUiOiIxNzMxMTM2OTc4MiIsImFkbWluIjpmYWxzZSwicGFzc3dvcmRfZm9yY2VkIjpmYWxzZSwiYXV0aG9yaXRpZXMiOlsiMTY1MTgzODAzNDk1NTU0NjYyNSIsIjE2NTE4MzMxMTE5ODc2OTU2MTciLCIxNjUxODQ0ODc4MjcyOTAxMTIxIiwiMTYyNzQ4Mzk4MTc0MDA1NjU3OCIsIjE3NzAyNjc5NTUyODA1NTYwMzMiLCIxODEzMTA1OTY1MzU1NzA4NDE3IiwiMTc5MzQ0MDg1OTkwODI4ODUxMyIsIjE4MTUyODc0NDYxNjY4MzUyMDEiLCIxNjUxODQ1NTU0NjI5NTg2OTQ1IiwiUk9MRV9BQ1RJVklUSV9VU0VSIiwiMTY1MTg0Njc5MTY5MzQxNDQwMSIsIjE2NTE4Mzc1MjI5ODIwMjMxNzAiLCIxNjU0MDM4MTQ1MjY5ODM3ODI1Il0sImNsaWVudF9pZCI6ImNsaWVudF8yIiwicGFzc3dvcmRfZXhwaXJhdGlvbl9yZW1pbmRlZCI6ZmFsc2UsImFkbWluaXN0cmF0ZWRfdGVuYW50cyI6WyI1ODE5NzI2MCIsIjU5OTk2MDUyIiwiMTgzMjE2MDIiLCI4Mjk3MDE0MCIsIjYyMjIwODk3IiwiNDYyNDI3MjgiLCI0NzU3ODE2MSIsIjYwNTE2MjY4IiwiNTU3NjQzNSJdLCJzY29wZSI6WyJzZWxlY3QiXSwibmFtZSI6Iui2hee6p-euoeeQhuWRmCIsInBhc3N3b3JkX2V4cGlyYXRpb25fZGF0ZSI6MTc1NDk4Njg1NzAwMCwiaWQiOjE0Nzg2MzY4ODY5ODQ1MjM3NzcsImV4cCI6MTgzMjg1MTgwNCwianRpIjoiN2ExMGIxMTYtMzY3ZS00NWRmLTg2YzYtYjE4NzI5ZWUxMWQ1In0.cN-nsq_eI1-noxSK4Ro6rKPGDjQgKKwJokKPRThwZi48M7GHRqmO4D7TyU8nZJxrQ4yyHQqB7RdVVq0xcMMNTBbBimjgTc68Zr1y2KhdVX2e6FnGH0pQsvTfMEleEmp1mnh3UDOxEwLk6y2dH4a-ts3JHffQ7tTurYbWcrGDsw0ib_nzYZxdXGYCxNyHKbOTYOJ5Xv4BEp3alUAtAVhd9YjA4Qs3D9f55tw4DWSsLdt7U34iqJu9-N-W7PKGPjHav2XhxJBe0pCltEarn31BSnA-o57Ag-N7vBbVij-B7y7A9mmpdiFs34bbMxeunq9P4nPMg1FzPtHtPm2xEF2kWA'
      authInfo.tenant = '58197260'
    } else {
      authInfo = await getAuthInfo()
    }
    initAuthStore(authInfo)
    genericAuthStore(authInfo)
  }

  private setCurrentSesstion (): void {
    // 设置集团tenant
    const urlParams = getUrlParams()
    if (urlParams.marketTenant !== undefined) {
      sessionStorage.setItem('marketTenant', urlParams.marketTenant)
    }
    if (urlParams.headTenant !== undefined) {
      sessionStorage.setItem('headTenant', urlParams.headTenant)
    }
    // 设置是否为app
    const loadEnv = getEnvironment()
    if (loadEnv === 'cubeApp') {
      sessionStorage.setItem('isApp', '1')
    } else {
      sessionStorage.removeItem('isApp')
    }
  }

  private installRouter (app: App<Element>): void {
    const base = '/apps/risk-management/h5'
    const router = createRouter({
      history: createWebHashHistory(base),
      routes
    })
    app.use(router)
  }

  private mount (app: App<Element>): void {
    app.mount('#app')
  }
}
