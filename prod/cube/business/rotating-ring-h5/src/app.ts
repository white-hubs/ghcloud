import { createApp, type App } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import { routes } from './router/index.ts'
import 'ant-design-vue/dist/antd.less'
import { Select } from 'ant-design-vue'
import { initAuthStore } from './api/api/auth-store.ts'
import { getAuthInfo } from '@ghcloud/cube-auth-utils'
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
      authInfo.token = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0ZW5hbnRzIjpbIjU4MTk3MjYwIiwiNTk5OTYwNTIiLCIxODMyMTYwMiIsIjgyOTcwMTQwIiwiNjIyMjA4OTciLCI0NjI0MjcyOCJdLCJwYXNzd29yZF9leHBpcmVkIjpmYWxzZSwidXNlcl9uYW1lIjoiMTczMTEzNjk3ODIiLCJhZG1pbiI6ZmFsc2UsInBhc3N3b3JkX2ZvcmNlZCI6ZmFsc2UsImF1dGhvcml0aWVzIjpbIjE2NTE4MzgwMzQ5NTU1NDY2MjUiLCIxNjUxODMzMTExOTg3Njk1NjE3IiwiMTY1MTg0NDg3ODI3MjkwMTEyMSIsIjE2NTE4MzY4Mjc1MjQ0NzY5MzAiLCIxNjI3NDgzOTgxNzQwMDU2NTc4IiwiMTc3MDI2Nzk1NTI4MDU1NjAzMyIsIjE4MTMxMDU5NjUzNTU3MDg0MTciLCIxNzkzNDQwODU5OTA4Mjg4NTEzIiwiMTgxNTI4NzQ0NjE2NjgzNTIwMSIsIjE2NTE4Mjk5ODEzNDI0MTI4MDIiLCIxNjUxODQ1NTU0NjI5NTg2OTQ1IiwiUk9MRV9BQ1RJVklUSV9VU0VSIiwiMTY1MTg0Njc5MTY5MzQxNDQwMSIsIjE2NTE4Mzc1MjI5ODIwMjMxNzAiLCIxNjU0MDM4MTQ1MjY5ODM3ODI1Il0sImNsaWVudF9pZCI6ImNsaWVudF8yIiwicGFzc3dvcmRfZXhwaXJhdGlvbl9yZW1pbmRlZCI6ZmFsc2UsImFkbWluaXN0cmF0ZWRfdGVuYW50cyI6WyI1ODE5NzI2MCIsIjU5OTk2MDUyIiwiMTgzMjE2MDIiLCI4Mjk3MDE0MCIsIjYyMjIwODk3IiwiNDYyNDI3MjgiXSwic2NvcGUiOlsic2VsZWN0Il0sIm5hbWUiOiLotoXnuqfnrqHnkIblkZgiLCJwYXNzd29yZF9leHBpcmF0aW9uX2RhdGUiOjE3NTQ5ODY4NTcwMDAsImlkIjoxNDc4NjM2ODg2OTg0NTIzNzc3LCJleHAiOjE4MjM0NTI2MjAsImp0aSI6ImFjNjA5MmExLTgxMDQtNGU4Ni04ZTczLTFjYTQ0YjQ2MWYwYiJ9.PY_JVTqq6eRe_qcUpQfPExD54UMEkmGdJ_BAFE3OifLLVeNdmKNLjkstWA0xduSvbJojfOpTjiImUkIwjjI-ZLOr5UlE-0gUE8HDo0mYqjpFazMf0kLpd9W2LphWTjbb6zBPqH4Up_Lx2UFufDUQrG0WDfsstlW967tFppE1Hpbr9yVWO9qfd1blA_zPST4_kLQ_oAg7UOMZZvDfdFuO59imsOlkIvh7a2rp0Wz1Mb1P-g0YKnvUqcFNKAuRZq61aBt2S7oQPTK-XYW01vpOqATdkt4o24gCmFy2L7_WMWiH18kT2ec_rzYFzW4XECRO2Uti_6yig059xQr1N2gy6A'
      authInfo.tenant = '58197260'
    } else {
      authInfo = await getAuthInfo()
    }
    initAuthStore(authInfo)
  }

  private installRouter (app: App<Element>): void {
    const base = '/apps/rotating-ring-h5'
    const router = createRouter({
      history: createWebHistory(base),
      routes
    })
    app.use(router)
    app.use(Select)
  }

  private mount (app: App<Element>): void {
    app.mount('#app')
  }
}
