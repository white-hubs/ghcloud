import { createApp, type App } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import { routes } from './router/index.ts'
import { createPinia } from 'pinia'
import { useStore } from './store/index.ts'
import { getAuthInfo } from '@ghcloud/cube-auth-utils'
import { initAuthStore, authStore } from './api/auth-store.ts'
import { initAuthHeadersByCubeAppBridge } from '@ghcloud/cube-app-js-sdk'
import { initAuthStore as genericAuthStore } from '@ghcloud/cube-app-generic-component'
import { CubeDictionaryService } from '@ghcloud/cube-dictionary-service'
import { getPublicTenant } from './api/identity.ts'
import { getEnvironment } from '@ghcloud/cube-app-js-sdk/src/js/cube-h5-config.ts'

interface RenderProps {
  container?: Element | string;
  base?: string;
}

export class Application {
  private readonly isTransferUrl = !window.location.pathname.includes('/platform-wxofficial-callback') && !window.location.pathname.includes('/platform-auth')
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
    const allowView = this.isTransferUrl ? await this.getViewPermission() : false
    const { App: component } = await import('./app.tsx')
    const app = createApp(component)
    app.use(createPinia())
    const store = useStore()
    try {
      store.inGhApp = getEnvironment() === 'cubeApp'
      await initAuthHeadersByCubeAppBridge()
    } catch (error) {
      // 当前处理非 APP 环境
      store.inGhApp = false
    } finally {
      this.installRouter(app, store.inGhApp, allowView)
      this.mount(app)
      this.#app = app
    }
  }

  private async handleAuthStore (): Promise<void> {
    let authInfo = {
      token: '',
      tenant: '',
      terminal: 'bimops-manage-app'
    }
    authInfo = await getAuthInfo()
    sessionStorage.setItem('GH-Token', JSON.stringify({ access_token: authInfo.token }))
    const code = window.location.search.split('?code=')[1] ?? ''
    sessionStorage.setItem('qrCode', code)
    // 没登录时获取tenant
    if (!authInfo.token && code && this.isTransferUrl) {
      const tenant = await getPublicTenant({ code })
      authInfo.tenant = tenant as string
    }
    if (authInfo.tenant)sessionStorage.setItem('GH-NowEnterprise', JSON.stringify({ code: authInfo.tenant }))
    initAuthStore(authInfo)
    genericAuthStore(authInfo)
  }

  // 获取字段
  private async getViewPermission (): Promise<boolean> {
    const cubeDictionaryService = new CubeDictionaryService(authStore)
    let allowView = false
    try {
      const fieldConfig = await cubeDictionaryService.getDictionaryItemByCode({ code: 'QRCODE_CONFIG' })
      if (fieldConfig) {
        const data = await cubeDictionaryService.getDictionaryByItem({ itemCode: 'QRCODE_CONFIG' })
        if (data.find(x => x.code === 'common_config')) {
          const configList = (data.find(x => x.code === 'common_config')?.variable && JSON.parse(data.find(x => x.code === 'common_config')?.variable ?? '')) ?? []
          allowView = configList.find((x: { key: string; }) => x.key === 'allowView')?.value ?? false
        }
      }
    } catch (err) {
    }
    return allowView
  }

  private installRouter (app: App<Element>, inGhApp: boolean, allowView: boolean): void {
    const base = '/apps/qrcode-transfer'
    const router = createRouter({
      history: createWebHistory(base),
      routes
    })
    router.beforeEach(async (to, from, next) => {
      const token = authStore.token
      if (inGhApp)next()
      if (!token && to.name !== 'login' && allowView) {
        next('/login')
      } else {
        if (from.redirectedFrom?.query)to.query = from.redirectedFrom?.query
        if (from.redirectedFrom?.query.code) {
          if (from.redirectedFrom?.query.code.includes('http://www.dbc61.com')) {
            const code = from.redirectedFrom.fullPath.split('?code=')[1] ?? ''
            const deCode = decodeURIComponent(code)
            sessionStorage.setItem('qrCode', deCode)
          } else {
            sessionStorage.setItem('qrCode', from.redirectedFrom?.query.code as string)
          }
        }
        next()
      }
    })
    app.use(router)
  }

  private mount (app: App<Element>): void {
    app.mount('#app')
  }
}
