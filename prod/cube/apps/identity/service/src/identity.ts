import { type CubeAuth, CubeGateway, type LegacyServiceError } from '@ghcloud/cube-gateway'

export interface QrcodeEntity {
  id?: number | null;
  name?: null | string;
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
  /**
   * 实体类型名称
   */
  entityTypeName?: null | string;
}
export interface GenerateBatch {
  id: string;
  code: string;
  name: string;
  entityType: string;
  entityTypeName: string;
  entityId: string;
  entityName: string;
  styleId: string;
  configJson: any;
  serialNumber: string;
}

export interface WechatOfficialQrcode {
  /**
   * 凭借此ticket可以在有效时间内换取二维码
   */
  ticket: null | string;
  /**
   * 二维码有效时间(秒)
   */
  expireSeconds: null | number;
  /**
   * 二维码图片解析后的地址
   */
  url: null | string;
}

export class CubeIdentityService {
  private readonly gateway: CubeGateway

  public constructor (auth: CubeAuth) {
    this.gateway = new CubeGateway(auth)
  }

  public async qrcodeOldCodeId (id: string): Promise<string> {
    const url = `/api/identity/qrcode/oldCode/${id}`
    const result = await this.gateway.get<LegacyServiceError<string>>({ url })
    return result.data|| result as unknown as string
  }

  /**
  * 获取生成二维码实体
  * @param code
  * @returns
  */
  public async getEntityByCode (code: string): Promise<QrcodeEntity | null> {
    const url = `/api/identity/qrcode/code?code=${code}`
    const result = await this.gateway.get<LegacyServiceError<QrcodeEntity | null>>({ url })
    return result.data || result as QrcodeEntity
  }

  /**
  * 获取微信公众号二维码
  * @returns
  */
  public async getWechatOfficialQrcode (): Promise<WechatOfficialQrcode | null> {
    const url = '/api/identity/wechat/public-service-account/qr-code'
    const result = await this.gateway.create<WechatOfficialQrcode | null>({ url })
    return result
  }

  // 下载二维码
  public async generateBatch (payload: {
    entityType: string;
    entityInfo: {
      entityId: number | string | undefined;
      entityName: number | string | undefined;
      serialNumber: number | string | undefined;
    }[];
    styleId?: string;
  }): Promise<Blob> {
    const url = '/api/identity/qrcode/generate/batch/download'
    return this.gateway.customBlob({ url, payload, method: 'POST' })
  }
}
