import { type CubeAuth, CubeGateway, type LegacyServiceError } from "@ghcloud/cube-gateway";
import { BASE_API } from "@ghcloud/cube-protocol";

import type { AreaFeature, AreaListVO, AreaStatus, AreaTag, ListVO, PageResult, PaginationOperationLogVO, GridLeaderArea } from "./type";

const baseURL = `${BASE_API}`;

export interface AreaTree {
  parentId: string;
  id: string;
  level: number;
  name: string;
  code: string;
  sequence: string;
  aliasName: string;
  sort: number;
  builtUpArea: string | null;
  areaManagerId: string;
  areaDepartmentId: string;
  areaManagerIds: string[];
  areaManagerName: string[];
  text?: string;
  children: AreaTree[];
}
export interface GetSceneMenu {
  id: string;
  name: string;
  sort: number;
  code: string;
  parentId: string | null;
  level: number;
  // fileVO: ReturnType;
  children: GetSceneMenu[];
  remark: string | null;
  sequence?: string | null;
}
export interface VideoSession {
  expireTimes: string;
  session: string;
}
export interface StreamMediaConfig {
  id: number;
  ipAddress: string; // 流媒体ip地址
  intranetAddress: string;
  name: string; // 流媒体名称
}

export interface MarketOverviewStatistics {
  /**
   * 占地面积
   */
  areaCovered: number;
  /**
   * 租户编号
   */
  code: string;
  /**
   * 企业宣传图信息
   */
  files: Record<string, unknown>[];
  /**
   * 占地总建筑面积
   */
  floorArea: number;
  id: string;
  /**
   * 租户名称
   */
  name: string;
  /**
   * 租户备注
   */
  remark: string;
  /**
   * 档位总数
   */
  stallNum: number;
  /**
   * 商户总数
   */
  supplierNum: number;
}

export interface StallPageList {
  total: number;
  pages: number;
  records: StallPage[];
}
export interface StallPage {
  id: string;
  code: string;
  name: string;
  type: string;
  typeName: string;
  area: string;
  areaNames: string;
  location: string;
  builtUpArea: string;
  practicalArea: string;
  masterName: string;
  deptId: string;
  deptIds: string[];
  deptNames: string[];
  leaseType: boolean;
  remark: string;
  enabled: boolean;
  bimBind: boolean;
  costRuleCount?: number;
  updateTime: number;
}

export interface StallTypeModel {
  id: string;
  name: string;
  enabled: boolean;
}

export interface Tenant {
  id: string;
  code: number;
  name: string;
  address: string;
  location: string;
  building: number;
  areaCovered: number;
  logoId: string;
  file: string;
  remark: string;
  enabled: boolean;
  admin: boolean;
  recentLogin: boolean;
  mainEnterprise: boolean;
  floorArea: number;
  files: unknown[];
}

export interface AreaRecord {
  /**
   * 区域别名
   */
  aliasName?: string | undefined;
  /**
   * 区域扩充配置
   */
  areaExtend: {
    /** 取悦介绍 */
    introduce: string;
    /**
     * 图片附件id集合
     */
    pictureFiles: string[];
    /**
     * 视频文件id集合
     */
    videoFiles: string[];
  };
  /**
   * 占地面积
   */
  builtUpArea?: string | undefined;
  /**
   * 是否启用
   */
  enabled?: boolean | undefined;
  /**
   * 区域名称
   */
  name: string;
  /**
   * 父类主键
   */
  parentId: string | null;
  /**
   * 序号
   */
  sort?: number | undefined;
  /**
   * 可视化区域类型
   */
  visualizationAreaType?: string | undefined;
  /**
   * 状态id
   */
  statusId?: null | string | undefined;
  /**
   * 标签ids(逗号隔开)
   */
  tagIds?: null | string | undefined;
  /**
   * 特征ids(逗号隔开)
   */
  featureIds?: null | string | undefined;
}

export class CubeMdataService {
  private readonly gateway: CubeGateway;
  public constructor(auth: CubeAuth) {
    this.gateway = new CubeGateway(auth);
  }

  /** 区域 */
  public async getAreaTree(tenant?: string): Promise<AreaTree[]> {
    tenant && this.gateway.updateAuth({ tenant });
    const url = `${baseURL}/mdata/area/list`;
    const resp = await this.gateway.get<LegacyServiceError<AreaTree[]>>({ url });
    return resp.data || resp;
  }

  /** 新增区域 */
  public async insertArea(params: AreaRecord): Promise<void> {
    const url = `${baseURL}/mdata/area/extend`;
    const payload = { ...params };
    await this.gateway.create<LegacyServiceError<void>>({ url, payload });
  }

  /** 排序批量更新区域 */
  public async editAreaSort(payload: Record<string, unknown>[]): Promise<void> {
    const url = `${baseURL}/mdata/area/sort/edit`;
    await this.gateway.create<LegacyServiceError<void>>({ url, payload });
  }

  /** 区域详情 */
  public async getAreaById(id: string): Promise<AreaRecord> {
    const url = `${baseURL}/mdata/area/${id}`;
    const res = await this.gateway.get<LegacyServiceError<AreaRecord>>({ url });
    return res.data || res;
  }

  /** 区域导出 */
  public async exportArea(payload: {
    pageNumber: number;
    pageSize: number;
    ids?: string;
    keyword?: string;

    areaNumber?: number | string | undefined;
    areaSymbol?: string | undefined;
    featureId?: number | string | undefined;
    statusId?: number | string | undefined;
    tagId?: number | string | undefined;
  }): Promise<Blob> {
    const url = `${baseURL}/mdata/area/export`;
    const resp = await this.gateway.customBlob({
      url,
      method: "GET",
      payload,
    });
    return resp;
  }
  /** 区域模版 */
  public async exportAreaTemplate(): Promise<Blob> {
    const url = `${baseURL}/mdata/area/import/template`;
    const resp = await this.gateway.customBlob({
      url,
      method: "GET",
    });
    return resp;
  }

  /** 区域导入 */
  public async importArea(payload: { file: Blob | null }): Promise<unknown> {
    const url = `${baseURL}/mdata/area/import`;
    const form = new FormData();
    form.append("file", payload.file);
    const resp = await this.gateway.custom<LegacyServiceError<unknown>>({
      url,
      payload: form,
      method: "POST",
    });
    return resp.data || resp;
  }
  /** 空间模版 */
  public async exportAreaSpaceTemplate(): Promise<Blob> {
    const url = `${baseURL}/mdata/area-space/import/template`;
    const resp = await this.gateway.customBlob({
      url,
      method: "GET",
    });
    return resp;
  }

  /** 空间导入 */
  public async importSpace(payload: { file: Blob | null }): Promise<unknown> {
    const url = `${baseURL}/mdata/area-space/import`;
    const form = new FormData();
    form.append("file", payload.file);
    const resp = await this.gateway.custom<LegacyServiceError<unknown>>({
      url,
      payload: form,
      method: "POST",
    });
    return resp.data || resp;
  }

  /** 更新区域 */
  public async updateArea(params: AreaRecord): Promise<void> {
    const url = `${baseURL}/mdata/area/extend`;
    const payload = { ...params };
    await this.gateway.update<LegacyServiceError<void>>({ url, payload });
  }
  /** 根据tenantId 获取 区域 */
  public async getAreaTreeByTenant(tenant: number): Promise<AreaTree[]> {
    const url = `${baseURL}/mdata/area/list`;
    const resp = await this.gateway.custom<LegacyServiceError<AreaTree[]>>({
      url,
      headers: {
        tenant: tenant + "",
      },
      method: "GET",
    });
    return resp.data || resp;
  }

  /** 根据id查区域 */
  public async getAreaNamesById(id: string): Promise<AreaTree[]> {
    const url = `${baseURL}/mdata/getAreaNamesById?id=${id}`;
    const resp = await this.gateway.get<LegacyServiceError<AreaTree[]>>({ url });
    return resp.data || resp;
  }

  /**
   * 获取业务菜单
   */
  public async getScenePage(productId: string): Promise<GetSceneMenu[]> {
    const url = `${baseURL}/mdata/scene-type/page?productId=${productId}`;
    const resp = await this.gateway.get<LegacyServiceError<GetSceneMenu[]>>({ url });
    return resp.data || resp;
  }

  /** 流媒体服务器配置列表 分页 */
  public async getStreamMediaConfig(payload: {
    pageSize: number;
    pageNumber: number;
    keyword?: string | undefined;
  }): Promise<{ records: StreamMediaConfig[]; total: number }> {
    const url = `${baseURL}/mdata/stream-media-configs`;
    const resp = await this.gateway.get<LegacyServiceError<{ records: StreamMediaConfig[]; total: number }>>({ url, payload });
    return resp.data || resp;
  }

  /** 当前流媒体服务器配置 */
  public async getCurrentStreamMediaConfig(): Promise<StreamMediaConfig> {
    const url = `${baseURL}/mdata/stream-media-config`;
    const resp = await this.gateway.get<LegacyServiceError<StreamMediaConfig>>({ url });
    return resp.data || resp;
  }

  /** 获取摄像机session */
  public async getVideoPtzSession(): Promise<VideoSession> {
    const url = `${baseURL}/mdata/video-ptz/login-session`;
    const resp = await this.gateway.get<LegacyServiceError<VideoSession>>({ url });
    return resp.data || resp;
  }

  /** 获取当前市场总览统计信息 */
  public async getMarketOverviewStatistics(): Promise<MarketOverviewStatistics> {
    const url = `${baseURL}/mdata/market-overview-statistics`;
    const resp = await this.gateway.get<LegacyServiceError<MarketOverviewStatistics>>({ url });
    return resp.data || resp;
  }

  /** 档位类型列表 */
  public async stallTypeList(payload: { enabled?: boolean }): Promise<StallTypeModel[]> {
    const url = `${baseURL}/mdata/stall-category/list`;
    const resp = await this.gateway.get<LegacyServiceError<StallTypeModel[]>>({ url, payload });
    return resp.data || resp;
  }

  /** 档位列表 */
  public async stallPage(payload: { pageSize: number; pageNumber: number; areaId?: string }): Promise<StallPageList> {
    const url = `${baseURL}/mdata/stall/page`;
    const resp = await this.gateway.get<LegacyServiceError<StallPageList>>({ url, payload });
    return resp.data || resp;
  }

  /** 档位详情 */
  public async getStallDetail(payload: { id: string }): Promise<unknown> {
    const url = `${baseURL}/mdata/stall/${payload.id}`;
    const resp = await this.gateway.get<LegacyServiceError<unknown>>({ url, payload });
    return resp.data || resp;
  }

  /** 档位-缺失经纬度时更新经纬度 */
  public async updateStallLntAndLatIfAbsent(
    id: string,
    payload: {
      lntAndLat: string;
      locationDes: string;
    },
  ): Promise<void> {
    const url = `${baseURL}/mdata/stall/${id}/updateLntAndLatIfAbsent`;
    await this.gateway.update<LegacyServiceError<void>>({ url, payload });
  }

  /** 我的企业 - 查询 */
  public async getTenantMine(): Promise<Tenant[]> {
    const url = `${baseURL}/mdata/tenant/mine`;
    const resp = await this.gateway.get<LegacyServiceError<Tenant[]>>({ url });
    return resp.data || resp;
  }

  /** 系统操作日志分页查询 */
  public async getOperationLogRecord(payload: {
    pageNumber: number;
    pageSize: number;
    method?: string | undefined;
    period?: string | undefined;
    result?: string | undefined;
    userName?: string | undefined;
  }): Promise<PaginationOperationLogVO> {
    const url = `${baseURL}/mdata/operation/log/record/page`;
    const resp = await this.gateway.get<PaginationOperationLogVO>({ url, payload });
    return resp;
  }

  /** 区域特征分页查询 */
  public async getAreaFeaturePage(payload: {
    pageNumber: number;
    pageSize: number;
    name?: string | undefined;
  }): Promise<PageResult<AreaFeature>> {
    const url = `${baseURL}/mdata/area-feature/page`;
    const resp = await this.gateway.get<PageResult<AreaFeature>>({ url, payload });
    return resp;
  }
  /** 区域特征列表 */
  public async getAreaFeatureList(payload?: { name?: string | undefined }): Promise<ListVO[]> {
    const url = `${baseURL}/mdata/area-feature/list`;
    const resp = await this.gateway.get<ListVO[]>({ url, payload });
    return resp;
  }
  /** 区域特征详情 */
  public async getAreaFeatureDetail(payload: { id: string }): Promise<AreaFeature> {
    const url = `${baseURL}/mdata/area-feature/detail/${payload.id}`;
    const resp = await this.gateway.get<AreaFeature>({ url, payload });
    return resp;
  }
  /** 区域特征新增 */
  public async addAreaFeature(payload: {
    createBy?: string | undefined;
    createTime?: string | undefined;
    deleted?: boolean | undefined;
    id?: number | string | undefined;
    name?: string | undefined;
    describe?: string | undefined;
    tenant?: number | string | undefined;
    updateBy?: string | undefined;
    updateTime?: string | undefined;
  }): Promise<void> {
    const url = `${baseURL}/mdata/area-feature/add`;
    const resp = await this.gateway.create<void>({ url, payload });
    return resp;
  }
  /** 区域特征修改 */
  public async updateAreaFeature(payload: {
    createBy?: string | undefined;
    createTime?: string | undefined;
    deleted?: boolean | undefined;
    id?: number | string | undefined;
    name?: string | undefined;
    describe?: string | undefined;
    tenant?: number | string | undefined;
    updateBy?: string | undefined;
    updateTime?: string | undefined;
  }): Promise<void> {
    const url = `${baseURL}/mdata/area-feature/edit`;
    const resp = await this.gateway.update<void>({ url, payload });
    return resp;
  }
  /** 区域特征删除 */
  public async deleteAreaFeature(payload: { id: string | number }): Promise<void> {
    const url = `${baseURL}/mdata/area-feature/remove`;
    const resp = await this.gateway.delete({ url, payload });
    return resp;
  }
  /** 区域标签分页查询 */
  public async getAreaTagPage(payload: { pageNumber: number; pageSize: number; name?: string | undefined }): Promise<PageResult<AreaTag>> {
    const url = `${baseURL}/mdata/area-tag/page`;
    const resp = await this.gateway.get<PageResult<AreaTag>>({ url, payload });
    return resp;
  }
  /** 区域标签列表 */
  public async getAreaTagList(payload?: { name?: string | undefined }): Promise<ListVO[]> {
    const url = `${baseURL}/mdata/area-tag/list`;
    const resp = await this.gateway.get<ListVO[]>({ url, payload });
    return resp;
  }
  /** 区域标签详情 */
  public async getAreaTagDetail(payload: { id: string }): Promise<AreaTag> {
    const url = `${baseURL}/mdata/area-tag/detail/${payload.id}`;
    const resp = await this.gateway.get<AreaTag>({ url, payload });
    return resp;
  }
  /** 区域标签新增 */
  public async addAreaTag(payload: {
    icoFileId?: string | undefined;
    name?: string | undefined;
    describe?: string | undefined;
  }): Promise<void> {
    const url = `${baseURL}/mdata/area-tag/add`;
    const resp = await this.gateway.create<void>({ url, payload });
    return resp;
  }
  /** 区域标签修改 */
  public async updateAreaTag(payload: {
    icoFileId?: string | undefined;
    id?: number | string | undefined;
    name?: string | undefined;
    describe?: string | undefined;
  }): Promise<void> {
    const url = `${baseURL}/mdata/area-tag/edit`;
    const resp = await this.gateway.update<void>({ url, payload });
    return resp;
  }
  /** 区域标签删除 */
  public async deleteAreaTag(payload: { id: string | number }): Promise<void> {
    const url = `${baseURL}/mdata/area-tag/remove`;
    const resp = await this.gateway.delete({ url, payload });
    return resp;
  }
  /** 区域状态分页查询 */
  public async getAreaStatusPage(payload: {
    pageNumber: number;
    pageSize: number;
    name?: string | undefined;
  }): Promise<PageResult<AreaStatus>> {
    const url = `${baseURL}/mdata/area-status/page`;
    const resp = await this.gateway.get<PageResult<AreaStatus>>({ url, payload });
    return resp;
  }
  /** 区域状态列表 */
  public async getAreaStatusList(payload?: { name?: string | undefined }): Promise<ListVO[]> {
    const url = `${baseURL}/mdata/area-status/list`;
    const resp = await this.gateway.get<ListVO[]>({ url, payload });
    return resp;
  }
  /** 区域状态详情 */
  public async getAreaStatusDetail(payload: { id: string }): Promise<AreaStatus> {
    const url = `${baseURL}/mdata/area-status/detail/${payload.id}`;
    const resp = await this.gateway.get<AreaStatus>({ url, payload });
    return resp;
  }
  /** 区域状态新增 */
  public async addAreaStatus(payload: {
    createBy?: string | undefined;
    createTime?: string | undefined;
    deleted?: boolean | undefined;
    id?: number | string | undefined;
    name?: string | undefined;
    describe?: string | undefined;
    tenant?: number | string | undefined;
    updateBy?: string | undefined;
    updateTime?: string | undefined;
  }): Promise<void> {
    const url = `${baseURL}/mdata/area-status/add`;
    const resp = await this.gateway.create<void>({ url, payload });
    return resp;
  }
  /** 区域状态修改 */
  public async updateAreaStatus(payload: {
    createBy?: string | undefined;
    createTime?: string | undefined;
    deleted?: boolean | undefined;
    id?: number | string | undefined;
    name?: string | undefined;
    describe?: string | undefined;
    tenant?: number | string | undefined;
    updateBy?: string | undefined;
    updateTime?: string | undefined;
  }): Promise<void> {
    const url = `${baseURL}/mdata/area-status/edit`;
    const resp = await this.gateway.update<void>({ url, payload });
    return resp;
  }
  /** 区域状态删除 */
  public async deleteAreaStatus(payload: { id: string | number }): Promise<void> {
    const url = `${baseURL}/mdata/area-status/remove`;
    const resp = await this.gateway.delete({ url, payload });
    return resp;
  }
  /** 空间分页列表 */
  public async getSpaceList(payload: {
    keyword?: string | undefined;
    areaSymbol?: string | undefined;
    featureId?: string | number | undefined;
    areaNumber?: string | number | undefined;
    statusId?: string | number | undefined;
    tagId?: string | number | undefined;
  }): Promise<AreaListVO[]> {
    const url = `${baseURL}/mdata/area-space/list`;
    const resp = await this.gateway.get<LegacyServiceError<AreaListVO[]>>({ url, payload });
    return resp.data || resp;
  }
  /** 空间新增 */
  public async addSpaceArea(payload: {
    createBy?: string | undefined;
    createTime?: string | undefined;
    deleted?: boolean | undefined;
    id?: number | string | undefined;
    name?: string | undefined;
    describe?: string | undefined;
    tenant?: number | string | undefined;
    updateBy?: string | undefined;
    updateTime?: string | undefined;
  }): Promise<void> {
    const url = `${baseURL}/mdata/area/add`;
    const resp = await this.gateway.create<void>({ url, payload });
    return resp;
  }
  /** 空间修改 */
  public async updateSpaceArea(payload: {
    createBy?: string | undefined;
    createTime?: string | undefined;
    deleted?: boolean | undefined;
    id?: number | string | undefined;
    name?: string | undefined;
    describe?: string | undefined;
    tenant?: number | string | undefined;
    updateBy?: string | undefined;
    updateTime?: string | undefined;
  }): Promise<void> {
    const url = `${baseURL}/mdata/area/edit`;
    const resp = await this.gateway.update<void>({ url, payload });
    return resp;
  }
  /** 空间关联标签 */
  public async linkSpaceTag(params: { areaId: string | number; tagIds: string }): Promise<void> {
    const url = `${baseURL}/mdata/area/link-tag`;
    const resp = await this.gateway.custom<void>({
      url,
      payload: params,
      method: "POST",
    });
    return resp;
  }

  /** 空间删除 */
  public async deleteArea(id: string | number): Promise<void> {
    const url = `${baseURL}/mdata/area/${id}`;
    const resp = await this.gateway.delete({ url });
    return resp;
  }
  /** 空间列表导出 */
  public async exportSpace(payload: {
    keyword?: string;
    areaNumber?: number | string | undefined;
    areaSymbol?: string | undefined;
    featureId?: number | string | undefined;
    statusId?: number | string | undefined;
    tagId?: number | string | undefined;
  }): Promise<Blob> {
    const url = `${baseURL}/mdata/area/space-export`;
    const resp = await this.gateway.customBlob({
      url,
      method: "GET",
      payload,
    });
    return resp;
  }

  /** 获取存在网格长的网格列表 */
  public async getGridLeaderAreaList(): Promise<GridLeaderArea[]> {
    const url = `${baseURL}/mdata/grid/area/grid-leader`;
    const resp = await this.gateway.get<GridLeaderArea[]>({ url });
    return resp;
  }
}
