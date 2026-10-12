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
import { storeKill } from './store/kill.ts'

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
      authInfo.token = 'eyJhbGciOiJSUzI1NiJ9.eyJzdWIiOiJjbGllbnRfMiIsInRlbmFudHMiOlsiNTgxOTcyNjAiLCI1OTk5NjA1MiIsIjE4MzIxNjAyIiwiODI5NzAxNDAiLCI2MjIyMDg5NyIsIjQ2MjQyNzI4IiwiNDc1NzgxNjEiLCI2MDUxNjI2OCIsIjU1NzY0MzUiLCIxNzgzNTMxNCIsIjM1Mzc5ODI5IiwiNzI3MzQyMTEiLCI0Mzk1MDI0MiIsIjkyNTM0NDAzIiwiNTEyNTk3MzUiLCI5OTE3NDExMyIsIjU2OTUwODk2IiwiNzYxMjUxOTgiLCIxNTQ0MTI3OSJdLCJwYXNzd29yZF9leHBpcmVkIjpmYWxzZSwidXNlcl9uYW1lIjoiMTczMTEzNjk3ODIiLCJpc3MiOiJodHRwOi8vMTkyLjE2OC4wLjI0MzoxMDA4NiIsImFkbWluIjpmYWxzZSwicGFzc3dvcmRfZm9yY2VkIjp0cnVlLCJhdWQiOiJjbGllbnRfMiIsInBhc3N3b3JkX2V4cGlyYXRpb25fcmVtaW5kZWQiOmZhbHNlLCJuYmYiOjE3Nzc0MzI2MDgsImFkbWluaXN0cmF0ZWRfdGVuYW50cyI6WyI1ODE5NzI2MCIsIjU5OTk2MDUyIiwiMTgzMjE2MDIiLCI4Mjk3MDE0MCIsIjYyMjIwODk3IiwiNDYyNDI3MjgiLCI0NzU3ODE2MSIsIjYwNTE2MjY4IiwiNTU3NjQzNSIsIjE3ODM1MzE0IiwiMzUzNzk4MjkiLCI3MjczNDIxMSIsIjQzOTUwMjQyIiwiOTI1MzQ0MDMiLCI1MTI1OTczNSIsIjk5MTc0MTEzIiwiNTY5NTA4OTYiLCI3NjEyNTE5OCIsIjE1NDQxMjc5Il0sInNjb3BlIjpbInNlbGVjdCJdLCJuYW1lIjoi6LaF57qn566h55CG5ZGYMyIsInBhc3N3b3JkX2V4cGlyYXRpb25fZGF0ZSI6eyJkYXRlIjp7InllYXIiOjIwMjYsIm1vbnRoIjo5LCJkYXkiOjE3fSwidGltZSI6eyJob3VyIjoxNiwibWludXRlIjo1Niwic2Vjb25kIjoyNSwibmFubyI6MH19LCJpZCI6IjE0Nzg2MzY4ODY5ODQ1MjM3NzciLCJleHAiOjE4Nzc0MzI2MDgsImlhdCI6MTc3NzQzMjYwOCwianRpIjoiNjJkZDEyNzEtMDg0NS00ZWQxLWE5N2YtM2YwYmRlNWQ3M2VhIn0.UBPWm_VDqI3GKLIrWHogeVMbJr6Hk0L_cKy4WtVfpROfeUTUe86C3QUYKl4EJA6D5TkOhLyOg0XV4qHq1r0I-R7d14kslEWlx2lYbuudVoKlloi7SUAZa7HQFInfGjWvsu7OGtdbjfoCXZZT5wbJHL1wi5gLTm6OF91RpaKdnTcoQyUK2uIOzdqWaaFRSYw0wTeSKkYKYL0I1kIC1-mzr2Nznucynab0zDErsgeX9sjYW6cMjwc__3deg5yB05ze8jLieYQ5vP0T0Vrpr2uAkkzxriP5kr7imdU7AtfFaiaJMXWl1T1xaO5L2osSJG6Hvr9XBCCI_wV4_Qwg5wmGRw'
      authInfo.tenant = '58197260'
    } else {
      authInfo = await getAuthInfo()
    }
    initAuthStore(authInfo)
    genericAuthStore(authInfo)
  }

  private installRouter (app: App<Element>): void {
    const base = '/apps/@ghcloud/cube-zhongda-heshun-h5'
    const router = createRouter({
      history: createWebHashHistory(base),
      routes
    })
    const killStore = storeKill()
    // 添加全局导航守卫来设置页面标题
    router.beforeEach((to, from, next) => {
      // 如果路由有meta.title，则设置为document.title
      if (to.meta && to.meta.title) {
        document.title = to.meta.title as string
      }
      killStore.updateGroupInfo()
      next()
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
