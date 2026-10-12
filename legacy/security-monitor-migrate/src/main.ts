import { qiankunWindow, renderWithQiankun, type QiankunProps } from 'vite-plugin-qiankun/dist/helper'
import { Application } from './app'
import { MFRootEventNameEnum, subscriber } from '@ghcloud/cube-mf-root'
import 'moment/dist/locale/zh-cn'
import { initAuthStore } from './api/auth-store'
import { initCubePlayerAuth,loadPlayerSDK } from '@ghcloud/cube-player'


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
    this.log('mount', props)
    initAuthStore(props.auth)
    initCubePlayerAuth(props.auth)
    loadPlayerSDK()
    this.app = new Application({ base: props.base, ...props })
    await this.appInstall()
    subscriber.subscribe(MFRootEventNameEnum.MF_ROOT_HEALTH, (info) => {
      this.log('[event]', info)
    })
  }

  private appInstall= async(): Promise<void> =>{
    let num = 0
    try{
      await this.app?.install()
    }catch{
      if(num>3){
        return
      }
      await this.app?.install()
      num++ 
    }
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
