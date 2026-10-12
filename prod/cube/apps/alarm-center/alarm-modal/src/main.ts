import { qiankunWindow, renderWithQiankun, type QiankunProps } from 'vite-plugin-qiankun/dist/helper'
import { Application } from './app'
import { logger } from './logger'

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
    this.app = new Application({ base: '/apps/@ghcloud/cube-alarm-modal' })
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

  private bootstrap (): void {
    logger.debug('bootstrap')
  }

  private mount (props: QiankunProps): void {
    this.app = new Application({ base: props.base, ...props })
    this.app.install()
  }

  private unmount (props: QiankunProps): void {
    logger.debug('unmount', props)
    this.app?.uninstall()
  }

  private update (props: QiankunProps): void {
    logger.debug('update', props)
  }
}

Main.run()
