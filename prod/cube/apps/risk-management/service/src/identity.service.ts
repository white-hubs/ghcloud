import { type CubeAuth, CubeGateway, type LegacyServiceError } from "@ghcloud/cube-gateway";
import { BASE_API } from "@ghcloud/cube-protocol";

const baseURL = `${BASE_API}/identity`;

export interface CodeStylePage {
  id: string;
  code: string;
  name: string;
  configJson: string;
  width: string;
  height: string;
  createTime: string;
  updateTime: string;
}

export interface QrcodeStyleList {
  total: number;
  pages: number;
  records: CodeStylePage[];
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
export interface CloudQrCodeConfig {
  id?: number;
  configName: string;
  appId: string;
  appSecret: string;
  serverUrl: string;
  enabled: boolean;
  remark?: string;
}
export class CubeIdentityService {
  private readonly gateway: CubeGateway;

  public constructor(auth: CubeAuth) {
    this.gateway = new CubeGateway(auth);
  }

  // 下载二维码
  public async generateBatch(payload: {
    entityType: string;
    entityInfo: {
      entityId: number | string | undefined;
      entityName: number | string | undefined;
      serialNumber: number | string | undefined;
    }[];
    styleId?: string;
  }): Promise<Blob> {
    const url = `${baseURL}/qrcode/generate/batch/download`;
    return this.gateway.customBlob({ url, payload, method: 'POST' });
  }

  // 二维码样式列表
  public async codeStylePage(payload: { pageNumber: number; pageSize: number }): Promise<QrcodeStyleList> {
    const url = `${baseURL}/qrcode/style/page`;
    const resp = await this.gateway.get<LegacyServiceError<QrcodeStyleList>>({ url, payload });
    return resp.data || resp;
  }

  /** 获取云二维码配置 */
  public async getCloudQrCodeConfig(): Promise<CloudQrCodeConfig> {
    const url = `${baseURL}/cloud-qr-cloud-config`;
    const resp = await this.gateway.get<CloudQrCodeConfig>({ url, payload: undefined });
    return resp;
  }

  /** 保存云二维码配置 */
  public async saveCloudQrCodeConfig(payload: {
    configName: string;
    appId: string;
    appSecret: string;
    serverUrl: string;
    enabled: boolean;
    remark?: string;
  }): Promise<void> {
    const url = `${baseURL}/cloud-qr-cloud-config`;
    await this.gateway.create<void>({ url, payload });
  }

  /** 同步二维码到云端 */
  public async syncQrCodeToCloud(): Promise<void> {
    const url = `${baseURL}/cloud-qr-code/sync`;
    await this.gateway.create<void>({ url, payload: undefined });
  }
}
