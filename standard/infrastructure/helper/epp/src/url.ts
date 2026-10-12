import qs from 'qs'

export class URLUtils {
  /**
   * 转换为 url params 格式（`a=1&b=2`）
   * @param params 转换对象
   */
  public static parseToQueryParams (params: Record<string, unknown>): string {
    return qs.stringify(params)
  }
}
