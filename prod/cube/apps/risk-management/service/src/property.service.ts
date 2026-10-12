import { type CubeAuth, CubeGateway, type LegacyServiceError } from "@ghcloud/cube-gateway";
import { BASE_API } from "@ghcloud/cube-protocol";

const baseURL = `${BASE_API}/property`;

export interface RiskSourceLedgerPage {
  pages: number;
  records: RiskSourceLedgerVO[];
  total: number;
}

/**
 * RiskSourceLedgerVO，查询结果
 */
export interface RiskSourceLedgerVO {
  /**
   * 区域id
   */
  areaId?: string;
  /**
   * 属性
   */
  attribute?: string;
  /**
   * 资产附件
   */
  file?: string;
  /**
   * 主键
   */
  id?: number;
  /**
   * 排序
   */
  level?: number;
  /**
   * 维护部门
   */
  maintenanceDepId?: number;
  /**
   * 维护部门
   */
  maintenanceDepName?: string;
  /**
   * 风险源名称
   */
  name?: string;
  /**
   * 数量
   */
  number?: number;
  /**
   * 配件信息
   */
  partsDetails?: PartsDetail[];
  /**
   * 使用部门id
   */
  receiveDepId?: number;
  /**
   * 使用部门名称
   */
  receiveDepName?: string;
  /**
   * 使用人
   */
  receiveUserName?: string;
  /**
   * 使用人电话
   */
  receiveUserPhone?: string;
  /**
   * 备注
   */
  remarks?: string;
  /**
   * 风险源编码
   */
  serialNumber?: string;
  /**
   * 现场点
   */
  sitePointId?: number;
  /**
   * 档位id
   */
  stallId?: number;
  /**
   * 状态
   */
  status?: string;
  /**
   * 风险源类别code
   */
  typeCode?: number;
  /**
   * 风险源类别名称
   */
  typeName?: string;
  /**
   * 使用到期日期
   */
  usageDate?: string;
  norms?: string;
  purchasingDate?: string;
  receiveUserType?: string;
}

/**
 * RiskSourceLedgerParam
 */
export interface Request {
  /**
   * 区域id
   */
  areaId?: string;
  /**
   * 属性
   */
  attribute?: string;
  /**
   * 资产附件
   */
  file?: string;
  /**
   * 主键
   */
  id?: number;
  /**
   * 排序
   */
  level?: number;
  /**
   * 维护部门
   */
  maintenanceDepId?: number;
  /**
   * 维护部门
   */
  maintenanceDepName?: string;
  /**
   * 风险源名称
   */
  name?: string;
  /**
   * 数量
   */
  number?: number;
  partsDetails?: PartsDetailsParam[];
  /**
   * 使用部门id
   */
  receiveDepId?: number;
  /**
   * 使用部门名称
   */
  receiveDepName?: string;
  /**
   * 使用人
   */
  receiveUserName?: string;
  /**
   * 使用人电话
   */
  receiveUserPhone?: string;
  /**
   * 备注
   */
  remarks?: string;
  /**
   * 风险源编码
   */
  serialNumber?: string;
  /**
   * 现场点
   */
  sitePointId?: number;
  /**
   * 档位id
   */
  stallId?: number;
  /**
   * 状态
   */
  status?: string;
  /**
   * 风险源类别code
   */
  typeCode?: number;
  /**
   * 风险源类别名称
   */
  typeName?: string;
  /**
   * 使用到期日期
   */
  usageDate?: string;
}

/**
 * 配件信息
 *
 * PartsDetailsParam
 */
export interface PartsDetailsParam {
  /**
   * 配件编号
   */
  code?: string;
  /**
   * 到期日期
   */
  expireDate?: string;
  id?: number;
  /**
   * 配件名称
   */
  name?: string;
  /**
   * 备注
   */
  remarks?: string;
}
export interface PartsDetail {
  /**
   * 配件编号
   */
  code?: string;
  /**
   * 到期日期
   */
  expireDate?: string;
  id?: number;
  /**
   * 配件名称
   */
  name?: string;
  /**
   * 备注
   */
  remarks?: string;
}
export interface File {
  id: string;
  name: string;
  suffix: string;
  path: string;
  size: number;
  refCount: number;
  type: string;
  businessKey?: string;
}

export interface RiskSourceLedgerDetails {
  id: string;
  serialNumber: string;
  norms: string;
  maintenanceUserId: string;
  latAndLon: string;
  maintenanceUserName: string;
  address: string;
  name: string;
  bimCode?: string;
  typeCode?: string;
  electronMobileType?: string;
  typeName: string;
  areaId: string;
  areaName: string;
  stallId?: string;
  stallName: string;
  sitePointId?: string;
  sitePointName: string;
  attribute: string;
  number: number;
  maintenanceDepId: string;
  maintenanceDepName: string;
  status: string;
  files: File[];
  remarks: string;
  receiveDepId: string;
  receiveDepName: string;
  receiveUserName: string;
  level?: string;
  receiveUserPhone: string;
  usageDate: number;
  mandatoryTestingDate: number;
  updateTime: number;
  deliveryAddress: string;
  produceAddress: string;
  deliveryCompany: string;
  produceFactory: string;
  receiveUserType: string;
  purchasingDate: string;
  plateNumber: string;
  insurance: string;
  efficiency: string;
  partsDetails: {
    code: string;
    name: string;
    expireDate: string;
    remarks: string;
    id: string;
  }[];
}
export class CubePropertyService {
  private readonly gateway: CubeGateway;

  public constructor(auth: CubeAuth) {
    this.gateway = new CubeGateway(auth);
  }

  // 分页查询风险源台账
  public async riskSourceLedgerPage(payload: {
    keyword?: string | undefined;
    typeCode?: string | undefined;
    maintenanceDepId?: string | undefined;
    receiveDepId?: string | undefined;
    status?: string | undefined;
    pageNumber: number;
    pageSize: number;
    purchasingDate?: string | undefined;
    usageDate?: string | undefined;
    areaId?: string | undefined;
    unboundBimCode?: boolean;
    sceneType?: string | undefined;
  }): Promise<RiskSourceLedgerPage> {
    const url = `${baseURL}/risk/source/ledger/page`;
    const resp = await this.gateway.get<LegacyServiceError<RiskSourceLedgerPage>>({ url, payload });
    return resp.data || resp;
  }

  // 查询风险源台账详情
  public async riskSourceLedgerDetails(payload: string): Promise<RiskSourceLedgerDetails> {
    const url = `${baseURL}/risk/source/ledger/queryById/${payload}`;
    const resp = await this.gateway.get<LegacyServiceError<RiskSourceLedgerDetails>>({ url });
    return resp.data || resp;
  }

  // 删除风险源台账
  public async riskSourceLedgerDelete(payload: number[]): Promise<void> {
    const url = `${baseURL}/risk/source/ledger/delete`;
    await this.gateway.update({ url, payload });
  }

  // 新增风险源台账
  public async riskSourceLedgerInsert(payload: unknown): Promise<void> {
    const url = `${baseURL}/risk/source/ledger/insert`;
    await this.gateway.create<LegacyServiceError<unknown>>({ url, payload });
  }

  // 下载风险源导入模板
  public async getTemplateExcel(): Promise<Blob> {
    const url = `${baseURL}/risk/source/ledger/getTemplateExcel`;
    const res = await this.gateway.customBlob({ method: "GET", url });
    return res;
  }

  // 风险源导入
  public async importTemplate(payload: Record<string, FormData>): Promise<void> {
    const url = `${baseURL}/risk/source/ledger/import/template`;
    await this.gateway.create({ url, payload });
  }

  // 更新风险源数据
  public async ledgerUpdate(payload: unknown): Promise<void> {
    const url = `${baseURL}/risk/source/ledger/update`;
    await this.gateway.update({ url, payload });
  }

  // 缺失经纬度时更新风险源位置
  public async updateRiskSourceLatAndLonIfAbsent(payload: { id: string; latAndLon: string; location: string }): Promise<void> {
    const url = `${baseURL}/risk/source/ledger/updateLatAndLonIfAbsent`;
    await this.gateway.update<LegacyServiceError<void>>({ url, payload });
  }

  // 获取类型
  public async getRiskSourceType(payload: Record<string, string | boolean | number>): Promise<any> {
    const url = `/api/dictionary/getCascadeDictionaryItem`;
    const res = await this.gateway.get({ url, payload });
    return res;
  }
}
