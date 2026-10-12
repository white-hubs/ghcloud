import { createApp, type App } from 'vue'
import { createRouter, createWebHashHistory } from 'vue-router'
import { routes } from './router/index.ts'
import { getAuthInfo } from '@ghcloud/cube-auth-utils'
import { initAuthStore } from './api/auth-store.ts'
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
    if (env.includes('dev') && runingEnvironment !== 'cubeApp') {
      authInfo.token = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0ZW5hbnRzIjpbIjU4MTk3MjYwIiwiNTk5OTYwNTIiLCIxODMyMTYwMiIsIjgyOTcwMTQwIiwiNjIyMjA4OTciLCI0NjI0MjcyOCIsIjQ3NTc4MTYxIiwiNjA1MTYyNjgiLCI1NTc2NDM1IiwiMzUzNzk4MjkiLCI3MjczNDIxMSIsIjQzOTUwMjQyIiwiOTI1MzQ0MDMiLCI1MTI1OTczNSIsIjk5MTc0MTEzIiwiNTY5NTA4OTYiXSwicGFzc3dvcmRfZXhwaXJlZCI6ZmFsc2UsInVzZXJfbmFtZSI6IjE3MzExMzY5NzgyIiwiYWRtaW4iOmZhbHNlLCJwYXNzd29yZF9mb3JjZWQiOnRydWUsImF1dGhvcml0aWVzIjpbIjE2NTE4NDY3OTE2OTM0MTQ0MDEiLCIxNzcyODMxNTkwODc2MDAwMjU4IiwiUk9MRV9BQ1RJVklUSV9VU0VSIiwiMTYwMjg0NzgyNjYzNzgyODA5NyIsIjE3NzY4NzA1ODQyMjgwNjUyODIiXSwiY2xpZW50X2lkIjoiY2xpZW50XzIiLCJwYXNzd29yZF9leHBpcmF0aW9uX3JlbWluZGVkIjpmYWxzZSwiYWRtaW5pc3RyYXRlZF90ZW5hbnRzIjpbIjU4MTk3MjYwIiwiNTk5OTYwNTIiLCIxODMyMTYwMiIsIjgyOTcwMTQwIiwiNjIyMjA4OTciLCI0NjI0MjcyOCIsIjQ3NTc4MTYxIiwiNjA1MTYyNjgiLCI1NTc2NDM1IiwiMzUzNzk4MjkiLCI3MjczNDIxMSIsIjQzOTUwMjQyIiwiOTI1MzQ0MDMiLCI1MTI1OTczNSIsIjk5MTc0MTEzIiwiNTY5NTA4OTYiXSwic2NvcGUiOlsic2VsZWN0Il0sIm5hbWUiOiLotoXnuqfnrqHnkIblkZgyIiwicGFzc3dvcmRfZXhwaXJhdGlvbl9kYXRlIjoxNzcxNjU2NjIyMDAwLCJpZCI6MTQ3ODYzNjg4Njk4NDUyMzc3NywiZXhwIjoxODUwNTgxNTg3LCJqdGkiOiJiY2QwODY3OS04NDU0LTQ5NTUtYWExZC1hZjA4NmJiMWQwYmUifQ.fo8Qmt1bnh6uqzTZANXcJGnhHDnYj1qQEwTY-in5aQfixe5oiFronm6JOBbpwrmp2R15mUI9GRaZqpE2hpVX5DqBNhMuoxaPF7EZMf456LVx39aFZANAiE_jkwmG_WS_kR2sgO_Rn7Y7GftvBRUfSB9yTKmqBYgScUwcEQP6LHo07Cwm2vgv_yQQxayH-MiuL-yBVvX7HypOXPBjzsiWvsrUSQGJtNQqhzTlkQRy-xPPcJSDA2HKUyvPoVk88Zp818qEQiLmGYIOl159YUDEVYGsSJOEEtMGdKYhZmtwvksryLYneiE8DHzGjLH3_lBVtY6sC4YcooW02x3McC4SYQ'
      authInfo.tenant = '29454808'
    } else {
      authInfo = await getAuthInfo()
    }
    initAuthStore(authInfo)
  }

  private installRouter (app: App<Element>): void {
    const base = '/apps/operating-room/h5'
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
