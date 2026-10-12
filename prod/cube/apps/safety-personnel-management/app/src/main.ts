import { qiankunWindow, renderWithQiankun, type QiankunProps } from 'vite-plugin-qiankun/dist/helper'
import { apiProxy } from '@ghcloud/cube-app-design'
import { Application } from './app'
import { initAuthStore } from './api/auth-store'
import { CubeTerminalEnum } from '@ghcloud/cube-protocol'
import { readSessionAuth } from './api/read-session-auth'
import { authRequest } from './hooks/use-auth-request'

class Main {
  public static run (): void {
    Main.initFileUploadFeature()
    new Main().init()
  }

  private static initFileUploadFeature (): void {
    const w = window as Window & { config?: { feature?: Record<string, unknown> } }
    w.config = w.config ?? {}
    w.config.feature = w.config.feature ?? {}
    w.config.feature.useUploadTemporary = true
  }

  private app?: Application

  private init (): void {
    if (!qiankunWindow.__POWERED_BY_QIANKUN__) {
      this.renderWithDefault()
      return
    }
    this.renderWithQiankun()
  }

  private renderWithDefault (): void {
    const auth = readSessionAuth()
    this.initAuth(auth)
    this.app = new Application({ base: '/apps/safety-personnel-management' })
    void this.app.install()
  }

  /** FileUpload 等 cube-app-design 组件从 sessionStorage / apiProxy 读取鉴权 */
  private syncSessionAuth (auth: { tenant: string; token: string }): void {
    sessionStorage.setItem('GH-Token', JSON.stringify({ access_token: auth.token }))
    sessionStorage.setItem('GH-NowEnterprise', JSON.stringify({ code: auth.tenant }))
  }

  private initAuth (auth: { tenant: string; token: string }): void {
    const normalized = {
      tenant: auth.tenant,
      token: auth.token.replace(/^Bearer\s+/i, '').trim(),
    }
    initAuthStore(normalized)
    authRequest.updateAuth({
      tenant: Number(normalized.tenant) || 0,
      terminal: CubeTerminalEnum.BUSINESS,
      token: normalized.token,
    })
    this.syncSessionAuth(normalized)
    apiProxy.updateAuth({
      tenant: normalized.tenant,
      terminal: CubeTerminalEnum.BUSINESS,
      token: normalized.token,
    })
  }

  private renderWithQiankun (): void {
    renderWithQiankun({
      bootstrap: () => undefined,
      mount: (props: QiankunProps) => {
        const auth = (props as QiankunProps & { auth?: { tenant: string; token: string } }).auth
        this.initAuth(auth?.tenant && auth?.token ? auth : readSessionAuth())
        this.app = new Application({ base: '/portal/safety-personnel-management', ...props })
        void this.app.install()
      },
      unmount: () => {
        void this.app?.uninstall()
      },
      update: () => undefined,
    })
  }
}

Main.run()
