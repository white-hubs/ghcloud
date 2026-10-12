import { createApp, type App } from 'vue'
import { createRouter, createWebHashHistory } from 'vue-router'
import { routes } from './router/index.ts'
import { getAuthInfo } from '@ghcloud/cube-auth-utils'
import { initAuthStore } from './api/auth-store.ts'
import { initAuthStore as initGenericComponentAuth } from '@ghcloud/cube-app-generic-component'
import { CubeTerminalEnum, type CubeAuth } from '@ghcloud/cube-protocol'
import { initAuthStore as initAppDesignAuthStore } from '@ghcloud/cube-h5-design/src/api/auth-store.ts'
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
    let authInfo = {
      token: '',
      tenant: '',
      terminal: CubeTerminalEnum.APP
    }
    // 方便开发时自定义token
    if (env === 'dev') {
      authInfo.token = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0ZW5hbnRzIjpbIjU4MTk3MjYwIiwiNTk5OTYwNTIiLCIxODMyMTYwMiIsIjgyOTcwMTQwIiwiNjIyMjA4OTciLCI0NjI0MjcyOCIsIjQ3NTc4MTYxIiwiNjA1MTYyNjgiLCI1NTc2NDM1IiwiMzUzNzk4MjkiLCI3MjczNDIxMSIsIjQzOTUwMjQyIiwiOTI1MzQ0MDMiLCI1MTI1OTczNSIsIjk5MTc0MTEzIiwiNTY5NTA4OTYiXSwicGFzc3dvcmRfZXhwaXJlZCI6ZmFsc2UsInVzZXJfbmFtZSI6IjE3MzExMzY5NzgyIiwiYWRtaW4iOmZhbHNlLCJwYXNzd29yZF9mb3JjZWQiOnRydWUsImF1dGhvcml0aWVzIjpbIjE2NTE4MzgwMzQ5NTU1NDY2MjUiLCIxNjUxODMzMTExOTg3Njk1NjE3IiwiMTY1MTg0NDg3ODI3MjkwMTEyMSIsIjE3NzY4NzA1ODQyMjgwNjUyODIiLCIxNjI3NDgzOTgxNzQwMDU2NTc4IiwiMTc3MDI2Nzk1NTI4MDU1NjAzMyIsIjE4MTMxMDU5NjUzNTU3MDg0MTciLCIxNzkzNDQwODU5OTA4Mjg4NTEzIiwiMTgxNTI4NzQ0NjE2NjgzNTIwMSIsIjE2NTE4NDU1NTQ2Mjk1ODY5NDUiLCJST0xFX0FDVElWSVRJX1VTRVIiLCIxNjUxODQ2NzkxNjkzNDE0NDAxIiwiMTY1MTgzNzUyMjk4MjAyMzE3MCIsIjE3NzI4MzE1OTA4NzYwMDAyNTgiLCIxNjAyODQ3ODI2NjM3ODI4MDk3IiwiMTY1NDAzODE0NTI2OTgzNzgyNSJdLCJjbGllbnRfaWQiOiJjbGllbnRfMiIsInBhc3N3b3JkX2V4cGlyYXRpb25fcmVtaW5kZWQiOmZhbHNlLCJhZG1pbmlzdHJhdGVkX3RlbmFudHMiOlsiNTgxOTcyNjAiLCI1OTk5NjA1MiIsIjE4MzIxNjAyIiwiODI5NzAxNDAiLCI2MjIyMDg5NyIsIjQ2MjQyNzI4IiwiNDc1NzgxNjEiLCI2MDUxNjI2OCIsIjU1NzY0MzUiLCIzNTM3OTgyOSIsIjcyNzM0MjExIiwiNDM5NTAyNDIiLCI5MjUzNDQwMyIsIjUxMjU5NzM1IiwiOTkxNzQxMTMiLCI1Njk1MDg5NiJdLCJzY29wZSI6WyJzZWxlY3QiXSwibmFtZSI6Iui2hee6p-euoeeQhuWRmDIiLCJwYXNzd29yZF9leHBpcmF0aW9uX2RhdGUiOjE3NzE2NTY2MjIwMDAsImlkIjoxNDc4NjM2ODg2OTg0NTIzNzc3LCJleHAiOjE4NDk2MDU5ODQsImp0aSI6Ijg5ODFlNzZjLTMxZTMtNDMyYS04Y2EwLTA5Y2RiMWU2ZWVmNCJ9.cpMDEpbgsp0f7Of_LCUkHqXem1cKk-ohkaJNuQtBEJZ1CbJ0Hc6_wpgoraiZS_Q72GLHqD2sZ6EsapRtbiz72OV768ETdYnYFasGvAi8jeDrCVSAgZYvN_WNMtgW3zvA3p652pPyHARSk4KVG8dDtOOHA-NPi595eF_y22V_h6Kzr6MEWP05x4ClZ8FoYHVMX6ci-svvKwTV2iEDgq7m7qohSQZ-4nxMp66xW0LJBwMt1ypwCInsy0_-ArBQiAmCVnXPXAHrv34oRsbevBT-03uTRzYzfbyh2IJS2rscssMxfhppy3r2my78ATjl9eDd6Q1QnbXEBkf2y2JBj4zJjg'
      authInfo.tenant = '58197260'
    } else {
      authInfo = await getAuthInfo() as CubeAuth
    }
    initAuthStore(authInfo)
    initAppDesignAuthStore(authInfo)
    initGenericComponentAuth(authInfo)
  }

  private installRouter (app: App<Element>): void {
    const base = '/apps/@ghcloud/cube-knowledge-document-h5'
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
