import { Application } from './app'

class Main {
  public static run (): void {
    new Main().init()
  }

  private app?: Application

  private constructor () {
  }

  public init (): void {
    this.app = new Application({ base: '/apps/@ghcloud/higreen-transfer-login-app' })
    this.app.install()
  }
}

Main.run()
