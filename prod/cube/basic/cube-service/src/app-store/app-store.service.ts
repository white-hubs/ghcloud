import { getAuthRequester } from '../request'
import type { Product } from './app-store.model'

const basePath = '/api/app-store'

export class AppStoreService {
  private static readonly authRequester = getAuthRequester()
  /**
   *
   * @returns 获取应用最新发布包
   * TODO(dank): 返回类型暂未定义，需实现共享状态后处理
   */
  public static async getNewestRunningProduct (appCode: string): Promise<Product> {
    const url = `${basePath}/apps/${appCode}/products@getNewestRunningProduct?terminalCode=bimops-manage-web`
    return this.authRequester.get({
      url,
    })
  }
}
