import { Application } from './app'
class Main {
  public static run (): void {
    new Main().init()
  }

  private app?: Application

  private constructor () {
  }

  public init (): void {
    this.renderApp()
  }

  private renderApp (): void {
    this.app = new Application({ base: '/apps/@ghcloud/cube-electronic-guide-client' })
    this.app.install()
  }
}

Main.run()
