import { Application } from "./app";
import { ensureCryptoRandomUUIDPolyfill } from "./util/crypto-random-uuid";

ensureCryptoRandomUUIDPolyfill();

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
    this.app.install();
  }
}

Main.run();
