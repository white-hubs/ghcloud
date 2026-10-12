import { type CubeAuth, CubeGateway, type LegacyServiceError } from "@ghcloud/cube-gateway";
import { BASE_API } from "@ghcloud/cube-protocol";

import { AssetClassifyType, AssetType, CheckAsset, HistoryRecordType, PropertyType, QrcodeEntityVO, SuppliesType } from "./types";

const basePropertyURL = `${BASE_API}/property`;

export class CubeAssetManagementService {
  private readonly gateway: CubeGateway;

  public constructor(auth: CubeAuth) {
    this.gateway = new CubeGateway(auth);
  }

  // 查询耗材库存情况
  public async getStockAvailability(): Promise<{ consumableNumber: number; stockMax: number; stockMin: number }> {
    const url = `${basePropertyURL}/consumable/visualization/stockAvailability`;
    const resp = await this.gateway.get<LegacyServiceError<{ consumableNumber: number; stockMax: number; stockMin: number }>>({ url });
    return resp.data || resp;
  }
  //资产报废统计
  public async getOverdue(): Promise<{ propertyNumber: number; usageNumber: number }> {
    const url = `${basePropertyURL}/property/visualization/overdue`;
    const resp = await this.gateway.get<LegacyServiceError<{ propertyNumber: number; usageNumber: number }>>({ url });
    return resp.data || resp;
  }
  //资产状态占比
  public async getPropertyByStatus(payload: { dimension: string; period: string }): Promise<PropertyType[]> {
    const url = `${basePropertyURL}/property/visualization/getPropertyByStatus`;
    const resp = await this.gateway.get<LegacyServiceError<PropertyType[]>>({ url, payload });
    return resp.data || resp;
  }
  //区域资产分布占比
  public async getPropertyBySourcePie(payload: { dimension: string; period: string }): Promise<PropertyType[]> {
    const url = `${basePropertyURL}/property/visualization/getPropertyBySourcePie`;
    const resp = await this.gateway.get<LegacyServiceError<PropertyType[]>>({ url, payload });
    return resp.data || resp;
  }
  //部门使用耗材占比
  public async getReduceStockStatByDep(payload: { dimension: string; period: string }): Promise<PropertyType[]> {
    const url = `${basePropertyURL}/consumable-reduce-record/getReduceStockStatByDep`;
    const resp = await this.gateway.get<LegacyServiceError<PropertyType[]>>({ url, payload });
    return resp.data || resp;
  }
  //耗材出库趋势
  public async getReduceRecord(payload: { dimension: string; period: string }): Promise<PropertyType[]> {
    const url = `${basePropertyURL}/consumable/visualization/reduceRecord`;
    const resp = await this.gateway.get<LegacyServiceError<PropertyType[]>>({ url, payload });
    return resp.data || resp;
  }
  //资产分类占比
  public async getPropertyByType(payload: { dimension: string; period: string }): Promise<PropertyType[]> {
    const url = `${basePropertyURL}/property/visualization/getPropertyByType`;
    const resp = await this.gateway.get<LegacyServiceError<PropertyType[]>>({ url, payload });
    return resp.data || resp;
  }
  //获取耗材数量
  public async getTotalMoney(payload: {
    pageNumber: number;
    pageSize: number;
    keyword: string;
    type: string;
  }): Promise<{ totalNum: number; totalMoney: number }> {
    const url = `${basePropertyURL}/consumable-store-stock/getTotalMoney`;
    const resp = await this.gateway.get<LegacyServiceError<{ totalNum: number; totalMoney: number }>>({ url, payload });
    return resp.data || resp;
  }
  //耗材分页查询（总体）
  public async getConsumablePage(payload: {
    pageNumber: number;
    pageSize: number;
    keyword: string;
    type: string;
  }): Promise<{ pages: number; records: SuppliesType[]; total: number }> {
    const url = `${basePropertyURL}/consumable/page`;
    const resp = await this.gateway.get<LegacyServiceError<{ pages: number; records: SuppliesType[]; total: number }>>({ url, payload });
    return resp.data || resp;
  }
  public async getConsumablePermissionPage(payload: {
    pageNumber: number;
    pageSize: number;
    keyword: string;
    type: string;
  }): Promise<{ pages: number; records: SuppliesType[]; total: number }> {
    const url = `${basePropertyURL}/consumable/page-permission`;
    const resp = await this.gateway.get<LegacyServiceError<{ pages: number; records: SuppliesType[]; total: number }>>({ url, payload });
    return resp.data || resp;
  }
  //耗材盘点单分页
  public async getConsumableCheckPage(payload: {
    pageNumber: number;
    pageSize: number;
    taskId?: string;
    id?: string;
    keyword?: string;
    status?: string;
  }): Promise<{ pages: number; records: CheckAsset[]; total: number }> {
    const url = `${basePropertyURL}/app/consumable-check/page`;
    const resp = await this.gateway.get<LegacyServiceError<{ pages: number; records: CheckAsset[]; total: number }>>({ url, payload });
    return resp.data || resp;
  }
  //耗材盘点单分页
  public async getConsumableCheckDetailPage(payload: {
    pageNumber: number;
    pageSize: number;
    taskId?: string;
    checkId?: string;
    id?: string;
    keyword?: string;
    status?: string;
  }): Promise<{ pages: number; records: CheckAsset[]; total: number }> {
    const url = `${basePropertyURL}/app/consumable-check-detail/page`;
    const resp = await this.gateway.get<LegacyServiceError<{ pages: number; records: CheckAsset[]; total: number }>>({ url, payload });
    return resp.data || resp;
  }
  // 耗材盘点明细添加
  public async addConsumableCheckDetail(payload: {
    checkId: string;
    consumableId: string;
    num: number;
    checkNum: number;
    remark: string;
    status: string;
  }): Promise<unknown> {
    const url = `${basePropertyURL}/consumable-check-detail`;
    const resp = await this.gateway.create<LegacyServiceError<unknown>>({ url, payload });
    return resp.data || resp;
  }
  //盘点任务列表(app)
  public async getTaskByUserIdPage(payload: {
    pageNumber: number;
    pageSize: number;
    taskId?: string;
    keyword?: string;
    status?: string;
  }): Promise<{ pages: number; records: CheckAsset[]; total: number }> {
    const url = `${basePropertyURL}/property/check/task/queryTaskByUserIdPage`;
    const resp = await this.gateway.get<LegacyServiceError<{ pages: number; records: CheckAsset[]; total: number }>>({ url, payload });
    return resp.data || resp;
  }
  //盘点单详情（app）
  public async getCheckTaskByTaskIdPage(payload: {
    pageNumber: number;
    pageSize: number;
    taskId?: string;
    taskStatus?: string;
  }): Promise<{ pages: number; records: AssetType[]; total: number }> {
    const url = `${basePropertyURL}/property/check/task/queryCheckTaskByTaskIdPage`;
    const resp = await this.gateway.get<LegacyServiceError<{ pages: number; records: AssetType[]; total: number }>>({ url, payload });
    return resp.data || resp;
  }
  //盘点单详情提交
  public async submitProperty(payload: {
    propertyId: string;
    taskId: string;
    checkStatus?: string;
    abnormalType?: string;
    abnormalRemarks?: string;
    abnormalFiles?: string[];
  }): Promise<{ pages: number; records: AssetType[]; total: number }> {
    const url = `${basePropertyURL}/property/check/task/submitProperty`;
    const resp = await this.gateway.create<LegacyServiceError<{ pages: number; records: AssetType[]; total: number }>>({ url, payload });
    return resp.data || resp;
  }
  //资产详情
  public async getQueryByTaskId(payload: { taskId?: string; id?: string }): Promise<CheckAsset> {
    const url = `${basePropertyURL}/property/detailed/queryByTaskId/${payload.id}`;
    const resp = await this.gateway.get<LegacyServiceError<CheckAsset>>({ url, payload });
    return resp.data || resp;
  }
  //查询资产金额、数量
  public async getPropertyStatistics(payload: {
    pageNumber: number;
    pageSize: number;
    keyword: string;
    status: string;
    areaId: string;
    typeId: string;
    sourceId: string;
    receiveDepId: string;
    warehousingStartDate?: string;
    warehousingEndDate?: string;
    usageDate: string;
  }): Promise<{ moneyTotal: number; numberTotal: number }> {
    const url = `${basePropertyURL}/property/detailed/getPropertyStatistics`;
    const resp = await this.gateway.get<LegacyServiceError<{ moneyTotal: number; numberTotal: number }>>({ url, payload });
    return resp.data || resp;
  }
  //资产清单分页查询
  public async getPropertyDetailedPage(payload: {
    pageNumber: number;
    pageSize: number;
    keyword?: string;
    status?: string;
    areaId?: string;
    typeId?: string;
    sourceId?: string;
    receiveDepId?: string;
    purchaseStartDate?: string;
    purchaseEndDate?: string;
    usageDate?: string;
  }): Promise<{ pages: number; records: AssetType[]; total: number }> {
    const url = `${basePropertyURL}/property/detailed/getPropertyDetailedPage`;
    const resp = await this.gateway.get<LegacyServiceError<{ pages: number; records: AssetType[]; total: number }>>({ url, payload });
    return resp.data || resp;
  }
  //资产类型查询
  public async getAssemblyClassifyPage(payload: {
    pageNumber?: number;
    pageSize?: number;
    name?: string;
    type: string;
  }): Promise<{ pages: number; records: AssetClassifyType[]; total: number }> {
    const url = `${basePropertyURL}/classify/getAssemblyClassifyPage`;
    const resp = await this.gateway.get<LegacyServiceError<{ pages: number; records: AssetClassifyType[]; total: number }>>({
      url,
      payload,
    });
    return resp.data || resp;
  }
  //查询资产履历
  public async getPropertyHistoryList(payload: {
    pageNumber: number;
    pageSize: number;
    id: string;
  }): Promise<{ pages: number; records: HistoryRecordType[]; total: number }> {
    const url = `${basePropertyURL}/property/history/getPropertyHistoryList`;
    const resp = await this.gateway.get<LegacyServiceError<{ pages: number; records: HistoryRecordType[]; total: number }>>({
      url,
      payload,
    });
    return resp.data || resp;
  }
  //通过ID查询详情
  public async getDetailById(payload: { pageNumber: number; pageSize: number; id: string }): Promise<AssetType> {
    const url = `${basePropertyURL}/property/detailed/${payload.id}`;
    const resp = await this.gateway.get<LegacyServiceError<AssetType>>({ url, payload });
    return resp.data || resp;
  }
  //更新数据
  public async updateAsset(payload: any): Promise<AssetType> {
    const url = `${basePropertyURL}/property/detailed/update`;
    const resp = await this.gateway.update<LegacyServiceError<AssetType>>({ url, payload });
    return resp.data || resp;
  }
  // 缺失经纬度时更新资产位置
  public async updateAssetLatAndLonIfAbsent(payload: { id: string; latAndLon: string; location: string }): Promise<void> {
    const url = `${basePropertyURL}/property/detailed/updateLatAndLonIfAbsent`;
    await this.gateway.update<LegacyServiceError<void>>({ url, payload });
  }
  //添加盘赢
  public async insertCheckWin(payload: any): Promise<AssetType> {
    const url = `${basePropertyURL}/property/detailed/insertCheckWin`;
    const resp = await this.gateway.create<LegacyServiceError<AssetType>>({ url, payload });
    return resp.data || resp;
  }
  //提交盘点计划、任务
  public async planSubmit(payload: any): Promise<AssetType> {
    const url = `${basePropertyURL}/property/check/plan/submit`;
    const resp = await this.gateway.get<LegacyServiceError<AssetType>>({ url, payload });
    return resp.data || resp;
  }
  //提交盘点计划、任务
  public async consumableSubmit(id: string): Promise<AssetType> {
    const url = `${basePropertyURL}/consumable-check/${id}/submit`;
    const resp = await this.gateway.get<LegacyServiceError<AssetType>>({ url });
    return resp.data || resp;
  }
  /**
   * 获取生成二维码实体
   * @param code
   * @returns
   */
  public async getEntityByCode(code: string): Promise<QrcodeEntityVO> {
    const url = `/api/identity/qrcode/code?code=${code}`;
    const result = await this.gateway.get<LegacyServiceError<QrcodeEntityVO>>({ url });
    return result.data;
  }
  // 资产编码批量校验
  public async checkPropertyCode(payload: { checkSerialNumberList: { key: string | null; value: string }[] }): Promise<string[]> {
    const url = `${basePropertyURL}/property/detailed/checkCodeBath`;
    const resp = await this.gateway.create<string[]>({ url, payload });
    return resp;
  }
}
