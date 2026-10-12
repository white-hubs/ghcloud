import { qiankunWindow, renderWithQiankun, type QiankunProps } from 'vite-plugin-qiankun/dist/helper'
import { Application } from './app'
import { initAuthStore } from './api/auth-store'
import { initGenericComponentAuth } from '@ghcloud/generic-component'

// import '@ghcloud/cube-ui/lib/style.css'

class Main {
  public static run (): void {
    new Main().init()
  }

  private app?: Application

  private constructor () {
  }

  public init (): void {
    if (!qiankunWindow.__POWERED_BY_QIANKUN__) {
      this.renderWithDefault()
      return
    }

    this.renderWithQiankun()
  }

  private renderWithDefault (): void {
    this.app = new Application({})
    this.app.install()
  }

  private renderWithQiankun (): void {
    renderWithQiankun({
      bootstrap: this.bootstrap.bind(this),
      mount: this.mount.bind(this),
      unmount: this.unmount.bind(this),
      update: this.update.bind(this)
    })
  }

  private log (): void {
  }

  private bootstrap (): void {
    // this.log('bootstrap')
  }

  private mount (props: QiankunProps): void {
    // this.log('mount', props)
    // TODO(danke): 子应用嵌入主应用被分配的基础路径，目前每个应用单独写死
    this.app = new Application({ base: '/portal/prepaid-system', ...props })
    this.app.install()
    initAuthStore({
      tenant: JSON.parse((sessionStorage.getItem('GH-NowEnterprise') as unknown as string)).code,
      token: JSON.parse((sessionStorage.getItem('GH-Token') as unknown as string)).access_token
    })
    initGenericComponentAuth(props.auth)
  }

  private unmount (): void {
    // this.log('unmount', props)
    this.app?.uninstall()
  }

  private update (): void {
    // this.log('update', props)
  }
}

Main.run()
