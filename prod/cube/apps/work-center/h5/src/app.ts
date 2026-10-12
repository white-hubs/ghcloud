import { createApp, type App } from 'vue'
import { createRouter, createWebHashHistory } from 'vue-router'
import { routes } from './router/index.ts'
import { initAuthStore } from './api/auth-store.ts'
import { getEnvironment } from '@ghcloud/cube-app-js-sdk/src/js/cube-h5-config.ts'
import { initAuthStore as genericAuthStore } from '@ghcloud/cube-app-generic-component'
import { getAuthInfo } from '@ghcloud/cube-auth-utils'
import { CubeTerminalEnum, type CubeAuth } from '@ghcloud/cube-protocol'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

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
      terminal: CubeTerminalEnum.APP
    }
    // 方便开发时自定义token
    if (env === 'dev' && runingEnvironment !== 'cubeApp') {
      authInfo.token = 'eyJhbGciOiJSUzI1NiJ9.eyJzdWIiOiJjbGllbnRfMiIsInRlbmFudHMiOlsiNTgxOTcyNjAiLCI1OTk5NjA1MiIsIjE4MzIxNjAyIiwiODI5NzAxNDAiLCI2MjIyMDg5NyIsIjQ2MjQyNzI4IiwiNDc1NzgxNjEiLCI2MDUxNjI2OCIsIjU1NzY0MzUiLCIxNzgzNTMxNCIsIjM1Mzc5ODI5IiwiNzI3MzQyMTEiLCI0Mzk1MDI0MiIsIjkyNTM0NDAzIiwiNTEyNTk3MzUiLCI5OTE3NDExMyIsIjU2OTUwODk2IiwiNzYxMjUxOTgiXSwicGFzc3dvcmRfZXhwaXJlZCI6ZmFsc2UsInVzZXJfbmFtZSI6IjE3MzExMzY5NzgyIiwiaXNzIjoiaHR0cDovLzE5Mi4xNjguMC4yNDM6MTAwODYiLCJhZG1pbiI6ZmFsc2UsInBhc3N3b3JkX2ZvcmNlZCI6dHJ1ZSwiYXVkIjoiY2xpZW50XzIiLCJwYXNzd29yZF9leHBpcmF0aW9uX3JlbWluZGVkIjpmYWxzZSwibmJmIjoxNzY3MDg4MjMyLCJhZG1pbmlzdHJhdGVkX3RlbmFudHMiOlsiNTgxOTcyNjAiLCI1OTk5NjA1MiIsIjE4MzIxNjAyIiwiODI5NzAxNDAiLCI2MjIyMDg5NyIsIjQ2MjQyNzI4IiwiNDc1NzgxNjEiLCI2MDUxNjI2OCIsIjU1NzY0MzUiLCIxNzgzNTMxNCIsIjM1Mzc5ODI5IiwiNzI3MzQyMTEiLCI0Mzk1MDI0MiIsIjkyNTM0NDAzIiwiNTEyNTk3MzUiLCI5OTE3NDExMyIsIjU2OTUwODk2IiwiNzYxMjUxOTgiXSwic2NvcGUiOlsic2VsZWN0Il0sIm5hbWUiOiLotoXnuqfnrqHnkIblkZgzIiwicGFzc3dvcmRfZXhwaXJhdGlvbl9kYXRlIjp7ImRhdGUiOnsieWVhciI6MjAyNiwibW9udGgiOjksImRheSI6MTd9LCJ0aW1lIjp7ImhvdXIiOjE2LCJtaW51dGUiOjU2LCJzZWNvbmQiOjI1LCJuYW5vIjowfX0sImlkIjoxNDc4NjM2ODg2OTg0NTIzNzc3LCJleHAiOjE4NjcwODgyMzIsImlhdCI6MTc2NzA4ODIzMiwianRpIjoiZjViNzcyNjItMWNjOC00MmYxLWE0NzAtN2YxZDNlOGI2ODY3In0.aXp_oGiCJCJnKa4JQ-CTztT-5aOUUp2BZtknaegSAqvNSaduxIarWfaz8qalqHGWmVlZzhl3f4b0Yho7R-ZfraKnysTKI36UXXpPkhv8BR936Y6IDpgjacg1imrOKuSZQOvjoO79n8BGGgShWuQY75PBIkl-ZC7aSd1yE6j1KzcXZ2sxQ_DWqC-yPs2UgQMB_HDYddlQIgtBKTOZmLcLfqS50_q9J0NU5wLa2jkOgBM2TmqbYi3PRmzadMI8J9VTqE0SPyXb-xEzPuyLZiOJwwCKQoeZ4UyBk3SFDVgi2ep5be-vgHBQbPAZnw0ivfPOKWTVbzQoVQbeh8PM1hO2nw'
      authInfo.tenant = '58197260'
    } else {
      authInfo = await getAuthInfo() as CubeAuth
    }
    initAuthStore(authInfo)
    genericAuthStore(authInfo)
  }
  private installRouter (app: App<Element>): void {
    const base = '/apps/work-center/h5'
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
