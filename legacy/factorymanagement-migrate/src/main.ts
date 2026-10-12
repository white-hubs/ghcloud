import { type QiankunProps, qiankunWindow, renderWithQiankun } from 'vite-plugin-qiankun/dist/helper'
import { Application } from './app'
import { MFRootEventNameEnum, subscriber } from '@ghcloud/cube-mf-root'
import 'moment/dist/locale/zh-cn'
import { initAuthStore } from './api/auth-store'

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

  private log (...args: unknown[]): void {
  }

  private bootstrap (): void {
    this.log('bootstrap')
  }

  private mount (props: QiankunProps): void {
    this.log('mount', props)
    initAuthStore(props.auth)
    this.app = new Application({ base: props.base, ...props })
    this.app.install()
    subscriber.subscribe(MFRootEventNameEnum.MF_ROOT_HEALTH, (info) => {
      this.log('[event]', info)
    })
  }

  private unmount (props: QiankunProps): void {
    this.log('unmount', props)
    this.app?.uninstall()
  }

  private update (props: QiankunProps): void {
    this.log('update', props)
  }
}

Main.run()
