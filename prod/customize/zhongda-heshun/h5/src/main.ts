import { Application } from './app'
import { setupVantFix } from './utils/vant-fix'

class Main {
  public static run (): void {
    // 应用Vant组件修复
    setupVantFix()
    new Main().init()
  }

  private app?: Application

  private constructor () {
  }

  public init (): void {
    this.renderWithDefault()
  }

  private renderWithDefault (): void {
    this.app = new Application({})
    this.app.install()
  }
}

Main.run()
