import { qiankunWindow, renderWithQiankun, type QiankunProps } from 'vite-plugin-qiankun/dist/helper'
import { Application } from './app'
import { logger } from './logger.ts'
import { initAuthStore } from './api/auth-store'
import { initGenericComponentAuth } from '@ghcloud/generic-component'
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
    logger.info('[Main]', ...args)
  }

  private bootstrap (): void {
    this.log('bootstrap')
  }

  private mount (props: QiankunProps): void {
    initAuthStore(props.auth)
    initGenericComponentAuth(props.auth)
    this.log('mount', props)
    this.app = new Application(props)
    this.app.install()
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
