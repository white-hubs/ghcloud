import { createApp, type App } from 'vue'
import { createRouter, createWebHashHistory } from 'vue-router'
import { routes } from './router/index.ts'
import { getAuthInfo } from '@ghcloud/cube-auth-utils'
import { initAuthStore } from './api/auth-store.ts'
import { initAuthStore as genericAuthStore } from '@ghcloud/cube-app-generic-component'
import { initAuthStore as initAppDesignAuthStore } from '@ghcloud/cube-h5-design/src/api/auth-store.ts'
import { getEnvironment } from '@ghcloud/cube-app-js-sdk/src/js/cube-h5-config.ts'
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
      terminal: 'bimops-manage-app'
    }
    // 方便开发时自定义token
    if (env === 'dev' && runingEnvironment !== 'cubeApp') {
      authInfo.token = 'eyJhbGciOiJSUzI1NiJ9.eyJzdWIiOiJjbGllbnRfMiIsInRlbmFudHMiOlsiNTgxOTcyNjAiLCI1OTk5NjA1MiIsIjE4MzIxNjAyIiwiODI5NzAxNDAiLCI2MjIyMDg5NyIsIjQ2MjQyNzI4IiwiNDc1NzgxNjEiLCI2MDUxNjI2OCIsIjU1NzY0MzUiLCIzNTM3OTgyOSIsIjcyNzM0MjExIiwiNDM5NTAyNDIiLCI5MjUzNDQwMyIsIjUxMjU5NzM1IiwiOTkxNzQxMTMiLCI1Njk1MDg5NiIsIjEwMTYyNjUyIiwiNTc2MDg0NTAiXSwicGFzc3dvcmRfZXhwaXJlZCI6ZmFsc2UsInVzZXJfbmFtZSI6IjE3MzExMzY5NzgyIiwiaXNzIjoiaHR0cDovLzE5Mi4xNjguNC43OTo0MDA5IiwiYWRtaW4iOmZhbHNlLCJwYXNzd29yZF9mb3JjZWQiOmZhbHNlLCJhdWQiOiJjbGllbnRfMiIsInBhc3N3b3JkX2V4cGlyYXRpb25fcmVtaW5kZWQiOmZhbHNlLCJuYmYiOjE3NjYzOTkyMTAsImFkbWluaXN0cmF0ZWRfdGVuYW50cyI6WyI1ODE5NzI2MCIsIjU5OTk2MDUyIiwiMTgzMjE2MDIiLCI4Mjk3MDE0MCIsIjYyMjIwODk3IiwiNDYyNDI3MjgiLCI0NzU3ODE2MSIsIjYwNTE2MjY4IiwiNTU3NjQzNSIsIjM1Mzc5ODI5IiwiNzI3MzQyMTEiLCI0Mzk1MDI0MiIsIjkyNTM0NDAzIiwiNTEyNTk3MzUiLCI5OTE3NDExMyIsIjU2OTUwODk2IiwiMTAxNjI2NTIiLCI1NzYwODQ1MCJdLCJzY29wZSI6WyJzZWxlY3QiXSwibmFtZSI6Iui2hee6p-euoeeQhuWRmCIsInBhc3N3b3JkX2V4cGlyYXRpb25fZGF0ZSI6eyJkYXRlIjp7InllYXIiOjIwMjYsIm1vbnRoIjoyLCJkYXkiOjIxfSwidGltZSI6eyJob3VyIjoxNCwibWludXRlIjo1MCwic2Vjb25kIjoyMiwibmFubyI6MH19LCJpZCI6MTQ3ODYzNjg4Njk4NDUyMzc3NywiZXhwIjoxODY2Mzk5MjEwLCJpYXQiOjE3NjYzOTkyMTAsImp0aSI6ImJiYjczM2JkLTIxY2EtNDllMi1iOTE3LWRlYWI1ZjM4MjUwMCJ9.Gl596tRVCqX3L4hg8GfOhyoeZUQUMHg07OGVLdbY48rYbM4V8ALsIkQCPpiVR_EfW7dXSo1DSvco6FKmdaTFNciudjZ84fMssi7_Gf5cRu0gX8Utz5jfI0StCmf6gyfJp8arjQYWUQd18IfU8sqWjWl4s6OQnmWtYn__ueOs2n4Dun1ptIrFq6iWvunFB8ETNRPYEfpMUySPRFs0Y4CALI1IRN5YIAmXtiiXwZmJCX2Wy-dA25Q3HJIopr4EGtlOWOps7n6zcamHHBT6-9zhgddXOEFYeR7T_aKMq_MP-Rcc85X47IQ35jCtTJTr8O2eGRSslTsLAOmXiPVoxSIISg'
      authInfo.tenant = '58197260'
      authInfo.token = authInfo.token.includes('Bearer') ? authInfo.token.split(' ')[1] : authInfo.token
      sessionStorage.setItem('GH-Token', JSON.stringify({ access_token: authInfo.token }))
      sessionStorage.setItem('GH-NowEnterprise', JSON.stringify({ code: authInfo.tenant }))
      // @ts-ignore
      window.__CUBE_AUTH_INFO__ = authInfo
    } else {
      authInfo = await getAuthInfo()
      sessionStorage.setItem('GH-Token', JSON.stringify({ access_token: authInfo.token }))
      sessionStorage.setItem('GH-NowEnterprise', JSON.stringify({ code: authInfo.tenant }))
    }
    initAuthStore(authInfo)
    genericAuthStore(authInfo)
    initAppDesignAuthStore(authInfo)
  }

  private installRouter (app: App<Element>): void {
    const base = '/apps/@ghcloud/cube-small-engineering-h5'
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
