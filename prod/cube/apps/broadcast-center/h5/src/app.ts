import { createApp, type App } from 'vue'
import { createRouter, createWebHashHistory } from 'vue-router'
import { routes } from './router/index.ts'
import { getAuthInfo } from '@ghcloud/cube-auth-utils'
import { initAuthStore } from './api/auth-store.ts'
import { initAuthStore as initIotCenterAuthStore } from '@ghcloud/cube-iot-center-h5/src/api/auth-store.ts'
import { initAuthStore as initGenericComponentAuth } from '@ghcloud/cube-app-generic-component'
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
      authInfo.token = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0ZW5hbnRzIjpbIjU4MTk3MjYwIiwiNTk5OTYwNTIiLCIxODMyMTYwMiIsIjgyOTcwMTQwIiwiNjIyMjA4OTciLCI0NjI0MjcyOCIsIjQ3NTc4MTYxIiwiNjA1MTYyNjgiLCI1NTc2NDM1Il0sInBhc3N3b3JkX2V4cGlyZWQiOmZhbHNlLCJ1c2VyX25hbWUiOiIxNzMxMTM2OTc4MiIsImFkbWluIjpmYWxzZSwicGFzc3dvcmRfZm9yY2VkIjpmYWxzZSwiYXV0aG9yaXRpZXMiOlsiMTY1MTgzODAzNDk1NTU0NjYyNSIsIjE2NTE4MzMxMTE5ODc2OTU2MTciLCIxNjUxODQ0ODc4MjcyOTAxMTIxIiwiMTYyNzQ4Mzk4MTc0MDA1NjU3OCIsIjE3NzAyNjc5NTUyODA1NTYwMzMiLCIxODEzMTA1OTY1MzU1NzA4NDE3IiwiMTc5MzQ0MDg1OTkwODI4ODUxMyIsIjE4MTUyODc0NDYxNjY4MzUyMDEiLCIxNjUxODQ1NTU0NjI5NTg2OTQ1IiwiUk9MRV9BQ1RJVklUSV9VU0VSIiwiMTY1MTg0Njc5MTY5MzQxNDQwMSIsIjE2NTE4Mzc1MjI5ODIwMjMxNzAiLCIxNjU0MDM4MTQ1MjY5ODM3ODI1Il0sImNsaWVudF9pZCI6ImNsaWVudF8yIiwicGFzc3dvcmRfZXhwaXJhdGlvbl9yZW1pbmRlZCI6ZmFsc2UsImFkbWluaXN0cmF0ZWRfdGVuYW50cyI6WyI1ODE5NzI2MCIsIjU5OTk2MDUyIiwiMTgzMjE2MDIiLCI4Mjk3MDE0MCIsIjYyMjIwODk3IiwiNDYyNDI3MjgiLCI0NzU3ODE2MSIsIjYwNTE2MjY4IiwiNTU3NjQzNSJdLCJzY29wZSI6WyJzZWxlY3QiXSwibmFtZSI6Iui2hee6p-euoeeQhuWRmCIsInBhc3N3b3JkX2V4cGlyYXRpb25fZGF0ZSI6MTc1NDk4Njg1NzAwMCwiaWQiOjE0Nzg2MzY4ODY5ODQ1MjM3NzcsImV4cCI6MTgzMzIwODk5OSwianRpIjoiNzk5ODMzY2ItZTlmMS00ODBmLTg4NjgtOGNiNjAzN2RhYWM5In0.MMfcihn9rrK_-bnaEtkdIOaRROhX7so6_1N1lKQapT_3bwFJX0PDpFnwPlcNkMab9IGRuBHT_pbfPoPaN2a5DmMIcnFXg-eVgB4PQ7ykEqhOhjzhE3Hg9Apy4Ah1jZPcMbCunDvyHo9l6WBbW1eKowlf5yeKS-8PDawkPtcqP160DfiFJzTCRpfW4DrBbEldvA4WaNlvJFdHXYzig0A58HS7WtQ9111_M3Be23ke5wZoPiytWkG-xgYc6qotjU1pQpqPesoEwVnZlg30_BET6KbGcZ2qqbYzqiWuUatb8lvQ4mEZAjiAvk8xDbSYcD4VRZDZawZ_m1c85yUeo3e-Eg'
      authInfo.tenant = '58197260'
    } else {
      authInfo = await getAuthInfo()
    }
    initAuthStore(authInfo)
    initGenericComponentAuth(authInfo)
    initIotCenterAuthStore(authInfo)
  }

  private installRouter (app: App<Element>): void {
    const base = '/apps/@ghcloud/cube-alarm-center-h5'
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
