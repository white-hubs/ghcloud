import { Approval } from './approval/approval'
import { Operates } from './operates/operates'
import { initAuthStore } from './api/auth-store'
import type { Options } from './type'
export * from './type'
export * from './process'
export class CubeStreamSDK {
  private static instance: CubeStreamSDK
  /** 创建实例,初始化鉴权信息 */
  public static init (options: Options): void {
    // 初始化鉴权信息
    initAuthStore(options.authStore)
  }

  /** 创建实例,初始化鉴权信息 */
  public static getInstance (): CubeStreamSDK {
    if (!this.instance) {
    // 初始化实例
      this.instance = new CubeStreamSDK()
      Object.freeze(CubeStreamSDK)
    }
    return this.instance
  }

  public readonly APPROVAL: Approval
  public readonly OPERATES: Operates
  private constructor () {
    this.APPROVAL = new Approval()
    this.OPERATES = new Operates()
  }
}
