import {
  type QiankunProps,
  qiankunWindow,
  renderWithQiankun
} from 'vite-plugin-qiankun/dist/helper'
import { Application } from './app'
import { initAuthStore } from './api/auth-store'
class Main {
  public static run(): void {
    new Main().init()
  }

  private app?: Application

  private constructor() { }

  public init(): void {
    if (!qiankunWindow.__POWERED_BY_QIANKUN__) {
      return this.renderWithDefault()
    }
    this.renderWithQiankun()
  }

  private renderWithDefault(): void {
    this.app = new Application({ base: '/energy' })
    this.app.install()
  }

  private renderWithQiankun(): void {
    renderWithQiankun({
      bootstrap: this.bootstrap.bind(this),
      mount: this.mount.bind(this),
      unmount: this.unmount.bind(this),
      update: this.update.bind(this),
    })
  }

  private log(...args: unknown[]): void {
  }

  private bootstrap(): void {
    this.log('bootstrap')
  }

  private mount(props: QiankunProps): void {
    this.log('mount', props)
    initAuthStore(props.auth)
    // TODO(danke): 子应用嵌入主应用被分配的基础路径，目前每个应用单独写死
    this.app = new Application({ base: '/portal/energymanagement', ...props })
    this.app.install()
  }

  private unmount(props: QiankunProps): void {
    this.log('unmount', props)
    this.app?.uninstall()
  }

  private update(props: QiankunProps): void {
    this.log('update', props)
  }
}

Main.run()
