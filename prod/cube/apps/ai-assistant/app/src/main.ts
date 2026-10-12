import { qiankunWindow, renderWithQiankun, type QiankunProps } from 'vite-plugin-qiankun/dist/helper'
import { Application } from './app'

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

  private bootstrap (): void {
  }

  private mount (props: QiankunProps): void {
    this.app = new Application({ base: '/portal/ai-assistant', ...props })
    this.app.install()
  }

  private unmount (): void {
    this.app?.uninstall()
  }

  private update (): void {
  }
}

Main.run()
