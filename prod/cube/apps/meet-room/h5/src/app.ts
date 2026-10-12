import { createApp, type App } from 'vue'
import { createRouter, createWebHashHistory } from 'vue-router'
import { routes } from './router/index.ts'
import { getAuthInfo } from '@ghcloud/cube-auth-utils'
import { initAuthStore } from './api/auth-store.ts'
import { initAuthStore as genericAuthStore } from '@ghcloud/cube-app-generic-component'
import { getEnvironment } from '@ghcloud/cube-app-js-sdk/src/js/cube-h5-config.ts'
import { cubeWxService } from '@ghcloud/cube-app-js-sdk'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import { CubeTerminalEnum } from '@ghcloud/cube-protocol'

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
    this.installStore(app)
    this.installRouter(app)
    this.mount(app)
    this.#app = app
  }
  public async uninstall (): Promise<void> {
    this.app.unmount()
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
      authInfo.token = 'eyJhbGciOiJSUzI1NiJ9.eyJzdWIiOiJjbGllbnRfMiIsInRlbmFudHMiOlsiNTgxOTcyNjAiLCI1OTk5NjA1MiIsIjE4MzIxNjAyIiwiODI5NzAxNDAiLCI2MjIyMDg5NyIsIjQ2MjQyNzI4IiwiNDc1NzgxNjEiLCI2MDUxNjI2OCIsIjU1NzY0MzUiLCIzNTM3OTgyOSIsIjcyNzM0MjExIiwiNDM5NTAyNDIiLCI5MjUzNDQwMyIsIjUxMjU5NzM1IiwiOTkxNzQxMTMiLCI1Njk1MDg5NiIsIjEwMTYyNjUyIl0sInBhc3N3b3JkX2V4cGlyZWQiOmZhbHNlLCJ1c2VyX25hbWUiOiIxNzMxMTM2OTc4MiIsImlzcyI6Imh0dHA6Ly8xOTIuMTY4LjAuMTMzOjQwMDkiLCJhZG1pbiI6ZmFsc2UsInBhc3N3b3JkX2ZvcmNlZCI6dHJ1ZSwiYXVkIjoiY2xpZW50XzIiLCJwYXNzd29yZF9leHBpcmF0aW9uX3JlbWluZGVkIjpmYWxzZSwibmJmIjoxNzYwMTY4NDEwLCJhZG1pbmlzdHJhdGVkX3RlbmFudHMiOlsiNTgxOTcyNjAiLCI1OTk5NjA1MiIsIjE4MzIxNjAyIiwiODI5NzAxNDAiLCI2MjIyMDg5NyIsIjQ2MjQyNzI4IiwiNDc1NzgxNjEiLCI2MDUxNjI2OCIsIjU1NzY0MzUiLCIzNTM3OTgyOSIsIjcyNzM0MjExIiwiNDM5NTAyNDIiLCI5MjUzNDQwMyIsIjUxMjU5NzM1IiwiOTkxNzQxMTMiLCI1Njk1MDg5NiIsIjEwMTYyNjUyIl0sIm5hbWUiOiLotoXnuqfnrqHnkIblkZgiLCJwYXNzd29yZF9leHBpcmF0aW9uX2RhdGUiOnsiZGF0ZSI6eyJ5ZWFyIjoyMDI2LCJtb250aCI6MiwiZGF5IjoyMX0sInRpbWUiOnsiaG91ciI6MTQsIm1pbnV0ZSI6NTAsInNlY29uZCI6MjIsIm5hbm8iOjB9fSwiaWQiOjE0Nzg2MzY4ODY5ODQ1MjM3NzcsImV4cCI6MTg2MDE2ODQxMCwiaWF0IjoxNzYwMTY4NDEwLCJqdGkiOiI5NGE4OWYzNC0zYTIwLTQ5NTAtYjA2NC1iM2Y5ODBmMjA0ZTkifQ.AnAjElq24ObyzVx0ulMO5PY13bvqY-0WfWvgsusgj32el-d-95OkTPVotu67go2Gq3ih1TNs3XlvQI5APb0SGz3ohDTwGxZMnvBAl4XhWO-yV1vrc8E2Q0l_gmMO9iPtt5SgFod4fr2jt75hiOCgAkiau3gLmS-vGqb9jJWnm1DaZ2ejI2xuHo00sPJ2hwQYeogVMaEMHLg_IIZWJ-y_yXyheoalOg2yqz-ioigJUeOl6V6N2G3HXcXn0sHhIvxfGizntEkvfCoEsI3Tz5OCR_M-55O0oQJKpzu_dVculKvArCpjTXITvTule7z4E5o4hd3urQU4M38JCQLvw_IVeA'
      authInfo.tenant = '58197260'
    } else {
      authInfo = await getAuthInfo()
    }
    initAuthStore(authInfo)
    genericAuthStore(authInfo)
  }

  private installRouter (app: App<Element>): void {
    const base = '/apps/@ghcloud/cube-meet-room-h5'
    const router = createRouter({
      history: createWebHashHistory(base),
      routes
    })
    app.use(router)
  }

  private installStore (app: App<Element>): void {
    const pinia = createPinia()
    pinia.use(piniaPluginPersistedstate)
    app.use(pinia)
  }
  private mount (app: App<Element>): void {
    app.mount('#app')
  }
}
