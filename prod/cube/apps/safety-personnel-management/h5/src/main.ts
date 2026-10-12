import { Application } from "./app";

import "./assets/style.less";

class Main {
  public static run(): void {
    new Main().init();
  }

  private app?: Application;

  private constructor() {}

  public init(): void {
    this.renderWithDefault();
  }

  private renderWithDefault(): void {
    this.app = new Application({});
    void this.app.install();
  }
}

Main.run();
