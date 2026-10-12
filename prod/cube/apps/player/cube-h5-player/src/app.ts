import { initAuthStore } from "./api/auth-store.ts";
import { apiConfig } from "./utils/api-config.ts";
import { getEnvironment } from "@ghcloud/cube-app-js-sdk/src/js/cube-h5-config.ts";
import { getAuthInfo } from "@ghcloud/cube-auth-utils";
import { initCubePlayerAuth, loadPlayerSDK } from "@ghcloud/cube-player";
import { CubeTerminalEnum, type CubeAuth } from "@ghcloud/cube-protocol";
import { createApp, type App } from "vue";

export class Application {
  #app?: App<Element>;

  private get app(): App<Element> {
    if (!this.#app) {
      throw new Error("app not initialized!");
    }
    return this.#app;
  }

  public async install(): Promise<void> {
    // 初始化 API 配置（处理动态环境地址）
    apiConfig.init();
    // 处理鉴权信息
    await this.handleAuthStore();
    // 加载播放器 SDK 资源
    loadPlayerSDK();
    // 导入并创建应用
    const { App: component } = await import("./app.tsx");
    const app = createApp(component);
    this.mount(app);
    this.#app = app;
  }

  public async uninstall(): Promise<void> {
    this.app.unmount();
  }

  private async handleAuthStore(): Promise<void> {
    const env = (import.meta as unknown as { env: { MODE: string } }).env.MODE;
    const runingEnvironment = getEnvironment();
    let authInfo = {
      token: "",
      tenant: "",
      terminal: CubeTerminalEnum.APP,
    };
    // 方便开发时自定义token
    if (env === "dev" && runingEnvironment !== "cubeApp") {
      authInfo.token =
        "eyJhbGciOiJSUzI1NiJ9.eyJzdWIiOiI1Mjk3OTI1MjQxZWJjZTc4ODMwNTQ3ODZjM2Y2YmUwYSIsImF1ZCI6IjUyOTc5MjUyNDFlYmNlNzg4MzA1NDc4NmMzZjZiZTBhIiwidGVuYW50cyI6WyIxNzA2MjUzNSJdLCJuYmYiOjE3NjYxMTI4MDMsImlzcyI6Imh0dHA6Ly8xOTIuMTY4LjIwMC4yNDU6NDAwOSIsImFkbWluIjpmYWxzZSwiaWQiOjE5ODU2MTAyMDc2NzQ4MjI2NTcsImV4cCI6MTg2NjExMjgwMywiaWF0IjoxNzY2MTEyODAzLCJqdGkiOiI1M2FkMjg0NC04NDFiLTQzZjYtOGM2ZC1jMjJkZTg2NzhlODUiLCJjbGllbnRfaWQiOjE5ODU2MTAyMDc2NzQ4MjI2NTd9.B2eqoo3LBCBHPB8Tf14W0Mfwh3UsB2r80Tz-n5AZn8AtHHCqL24Y-TDEwwZ_9ePbM6jAU54G-7oZHIiu9w51MyHvfBfkclXmcNQRsQzGj3rZrIVWVZQFvi1R6dzMAogR2nDHMVkj2dyt9Z5tjUIjy-YD9MqZjQrnbJ5m1NN6EBkO7VziYtpO843IvnLmAzh2O_59QldfcYPactsJay1V70BnIYyR9KsvIxhaxE6miBv7S2RJFMXZRTA3I0gccmCj3jxtpSGBTj4JRyXPJx7ElYgqJ4IKJIYtiuZ5yeKpvCFfqWZuNdwAZEk1QLTMD_B-uTOxLxH78hNvWltIe21HCA";
      authInfo.tenant = "17062535";
    } else {
      authInfo = (await getAuthInfo()) as CubeAuth;
    }
    // 初始化本地认证存储
    initAuthStore(authInfo);
    // 初始化 CubePlayer 认证存储
    initCubePlayerAuth(authInfo);
  }

  private mount(app: App<Element>): void {
    app.mount("#app");
  }
}
