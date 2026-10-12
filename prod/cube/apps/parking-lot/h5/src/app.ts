import { createApp, type App } from 'vue'
import { createRouter, createWebHashHistory } from 'vue-router'
import { routes } from './router/index.ts'
import { getAuthInfo } from '@ghcloud/cube-auth-utils'
import { initAuthStore } from './api/auth-store.ts'
import { getEnvironment } from '@ghcloud/cube-app-js-sdk/src/js/cube-h5-config.ts'
import { initAuthStore as genericAuthStore } from '@ghcloud/cube-app-generic-component'
import { CubeTerminalEnum, type CubeAuth } from '@ghcloud/cube-protocol'

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
      terminal: CubeTerminalEnum.APP
    }
    // 方便开发时自定义token
    if (env.includes('dev') && runingEnvironment !== 'cubeApp') {
      authInfo.token = 'eyJhbGciOiJSUzI1NiJ9.eyJzdWIiOiJjbGllbnRfMiIsInRlbmFudHMiOlsiNTgxOTcyNjAiLCI1OTk5NjA1MiIsIjE4MzIxNjAyIiwiODI5NzAxNDAiLCI2MjIyMDg5NyIsIjQ2MjQyNzI4IiwiNDc1NzgxNjEiLCI2MDUxNjI2OCIsIjU1NzY0MzUiLCIxNzgzNTMxNCIsIjM1Mzc5ODI5IiwiNzI3MzQyMTEiLCI0Mzk1MDI0MiIsIjkyNTM0NDAzIiwiNTEyNTk3MzUiLCI5OTE3NDExMyIsIjU2OTUwODk2IiwiNzYxMjUxOTgiXSwicGFzc3dvcmRfZXhwaXJlZCI6ZmFsc2UsInVzZXJfbmFtZSI6IjE3MzExMzY5NzgyIiwiaXNzIjoiaHR0cDovLzE5Mi4xNjguMC4yNDM6MTAwODYiLCJhZG1pbiI6ZmFsc2UsInBhc3N3b3JkX2ZvcmNlZCI6dHJ1ZSwiYXVkIjoiY2xpZW50XzIiLCJwYXNzd29yZF9leHBpcmF0aW9uX3JlbWluZGVkIjpmYWxzZSwibmJmIjoxNzcwMjc2MTgyLCJhZG1pbmlzdHJhdGVkX3RlbmFudHMiOlsiNTgxOTcyNjAiLCI1OTk5NjA1MiIsIjE4MzIxNjAyIiwiODI5NzAxNDAiLCI2MjIyMDg5NyIsIjQ2MjQyNzI4IiwiNDc1NzgxNjEiLCI2MDUxNjI2OCIsIjU1NzY0MzUiLCIxNzgzNTMxNCIsIjM1Mzc5ODI5IiwiNzI3MzQyMTEiLCI0Mzk1MDI0MiIsIjkyNTM0NDAzIiwiNTEyNTk3MzUiLCI5OTE3NDExMyIsIjU2OTUwODk2IiwiNzYxMjUxOTgiXSwic2NvcGUiOlsic2VsZWN0Il0sIm5hbWUiOiLotoXnuqfnrqHnkIblkZgzIiwicGFzc3dvcmRfZXhwaXJhdGlvbl9kYXRlIjp7ImRhdGUiOnsieWVhciI6MjAyNiwibW9udGgiOjksImRheSI6MTd9LCJ0aW1lIjp7ImhvdXIiOjE2LCJtaW51dGUiOjU2LCJzZWNvbmQiOjI1LCJuYW5vIjowfX0sImlkIjoiMTQ3ODYzNjg4Njk4NDUyMzc3NyIsImV4cCI6MTg3MDI3NjE4MiwiaWF0IjoxNzcwMjc2MTgyLCJqdGkiOiI4MDhkZmY2Ny05NDc4LTRjNmUtYWExMC0yMWNjYzliY2QzMWEifQ.OTAdlBAG1HJ9t4f5qy6qIWXNtu9MAdfDhz-KiIj0lexjFGrfwsZ7pARvTk0tpM--Pahpjk1YTR_x4y11bCIkd-A2l4orIAB7Y6fn7giw_3e-KmOn7NAR4vwC9kdzgd7XSVztjw2CDvOAUFDQbNwf-ITnCme76xWy4QYlnTdGhAy0PR3MLigmtHuPSVwewqKS3xNXF5bWEIHtr6NQfgQxDuRmOhVRVp1v7jyy9FnBavQoZMEP2_oF-W7qYwSaeXxLQYzDCHB8S42oNLlrF1N3bfB3rz1yuj6CODHqgw0HjTDk7OuP6k7FxzVy4nT_TuPxWhzfjgIdYgAgg7MccByaxw'
      authInfo.tenant = '58197260'
    } else {
      authInfo = await getAuthInfo() as CubeAuth
    }
    initAuthStore(authInfo)
    genericAuthStore(authInfo)
  }

  private installRouter (app: App<Element>): void {
    const base = '/apps/parking-lot/h5'
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
