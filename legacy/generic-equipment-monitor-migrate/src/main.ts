import { qiankunWindow, renderWithQiankun, type QiankunProps } from 'vite-plugin-qiankun/dist/helper'
import { Application } from './app'
import { MFRootEventNameEnum, subscriber } from '@ghcloud/cube-mf-root'
import 'moment/dist/locale/zh-cn'
import { initAuthStore } from './api/auth-store'
import { initCubePlayerAuth } from '@ghcloud/cube-player'
import { getConfigList } from '@ghcloud/cube-business-alias-manage-plugin'


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

  private async mount (props: QiankunProps): Promise<void> {
    await getConfigList(props.auth)
    this.log('mount', props)
    try {
      // TODO(zee) 由于admin端会用到通用模块，临时把tenant重新赋值
      props.auth.tenant= JSON.parse(sessionStorage.getItem('GH-NowEnterprise')!).code
    } catch (error) {
      
    }
    initAuthStore(props.auth)
    initCubePlayerAuth(props.auth)
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
