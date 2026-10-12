import { Application } from "./app";

class Main {
  public static run(): void {
    Main.initFileUploadFeature();
    new Main().init();
  }

  private static initFileUploadFeature(): void {
    const w = window as Window & { config?: { feature?: Record<string, unknown> } };
    w.config = w.config ?? {};
    w.config.feature = w.config.feature ?? {};
    w.config.feature.useUploadTemporary = true;
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
