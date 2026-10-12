import { getApiBaseUrL, getAuthHeaders } from '@ghcloud/cube-app-js-sdk'
import { HTTPClientImpl } from '../../infrastructure/http-client'
import { BaseAPIResult } from '../base-api'

/**
 * QrcodeEntityVO
 */
interface QrcodeEntityVO {
  /**
   * 编号
   */
  code?: null | string;
  /**
   * 实体ID
   */
  entityId?: null | string;
  /**
   * 实体名称
   */
  entityName?: null | string;
  /**
   * 实体类型
   */
  entityType?: null | string;
  id?: number | null;
  /**
   * 名称
   */
  name?: null | string;
}

class IdentityService {
  private readonly client = new HTTPClientImpl({
    baseURL: getApiBaseUrL()??'/api',
    headers: getAuthHeaders()
  })

  /**
   *
   * @returns 档位列表 物联1.0
   */
  public async getEntityByCode (code:string): Promise<QrcodeEntityVO> {
    const result = await this.client.get<QrcodeEntityVO>('/identity/qrcode/code?code='+code)
    return result
  }
}

export const identityService = new IdentityService()
