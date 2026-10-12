import { Application } from './app'

class Main {
  public static run (): void {
    new Main().init()
  }

  private app?: Application

  private constructor () {
  }

  public init (): void {
    this.app = new Application({ base: '/apps/@ghcloud/farmland-data-viz' })
    this.app.install()
  }
}

Main.run()
