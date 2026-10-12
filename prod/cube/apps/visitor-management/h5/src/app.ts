import { createApp, type App } from 'vue'
import { createRouter, createWebHashHistory } from 'vue-router'
import { routes } from './router/index.ts'
import { cubeWxService } from '@ghcloud/cube-app-js-sdk'
import { initAuthStore } from './api/auth-store.ts'
import { getAuthInfo } from '@ghcloud/cube-auth-utils'
import { getEnvironment } from '@ghcloud/cube-app-js-sdk/src/js/cube-h5-config.ts'
import { CubeTerminalEnum, type CubeAuth } from '@ghcloud/cube-protocol'

export class Application {
  #app?: App<Element>

  private get app (): App<Element> {
    if (!this.#app) {
      throw new Error('app not initialized!')
    }
    return this.#app
  }

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
      terminal: CubeTerminalEnum.APP,
    }
    // 微信小程序
    const isWxMini = await cubeWxService.getWxEnv()
    // 方便开发时自定义token
    if (env === 'dev' && runingEnvironment !== 'cubeApp' && !isWxMini) {
      authInfo.token = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0ZW5hbnRzIjpbIjI4Njg2MzkzIl0sInBhc3N3b3JkX2V4cGlyZWQiOnRydWUsInVzZXJfbmFtZSI6IjE3MzExMzY5NzgyIiwiYWRtaW4iOmZhbHNlLCJwYXNzd29yZF9mb3JjZWQiOnRydWUsImF1dGhvcml0aWVzIjpbIjE4NzI0ODI2NjQ3NTc4OTkyNjUiLCJST0xFX0FDVElWSVRJX1VTRVIiLCIxODgwMjEyNjI4OTgxNzU1OTA2Il0sImNsaWVudF9pZCI6ImNsaWVudF8yIiwicGFzc3dvcmRfZXhwaXJhdGlvbl9yZW1pbmRlZCI6dHJ1ZSwiYWRtaW5pc3RyYXRlZF90ZW5hbnRzIjpbIjI4Njg2MzkzIl0sInNjb3BlIjpbInNlbGVjdCJdLCJuYW1lIjoi5Y-k5rKz5LqR5bmz5Y-w566h55CG5ZGYIiwiaWQiOjE4NzI1NTgxNDA0NTA5OTYyMjUsImV4cCI6MTg0MzQ4OTg1NCwianRpIjoiOTg2YjU3NDctODA2MS00MDViLTkxNGMtYzkwZGMxMjU0MTgyIn0.AMJY_UcLs0YRnpH-TGaUx1rZxbdeZe6AszmOozKjYYgubkXjWFOxXF_UDVAFEnDOjs6ypyLQiWE8pWn-AWpEZxnfO5C8YDTy3iuo1PTCKdv3LPFm9IUhQPJdNRlSxwQEaL901nXBSkbZylrXVVy38wjfKu9ExOZ59SlF9gu4m1RXVYBmnsQynPgUUiqhQQW0gEonF7irv1L1nx_ZW-vJm9UuqDfzsYSjUCvVUq8RH3P85pq9nJJuawIzvU1yUH0RfnBw9KdAGt6LLxXPGKobntqKcclpOPWRN3GVlMAiEjATol96uHYlnq6LBUJdsuh_qNOPrrql4Z0j679lGxXR1Q'
      authInfo.tenant = '28686393'
    } else {
      authInfo = await getAuthInfo() as CubeAuth
    }
    initAuthStore(authInfo)
  }

  private installRouter (app: App<Element>): void {
    const base = '/apps/@ghcloud/cube-visitor-management-h5'
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
