import type {
  AreaModel,
  BusinessTagModel,
  PageResult,
  StallModel,
  DeviceModel,
  SitePointModel,
  PropertyModel,
  RiskSourceModel,
  SmallEngineeringModel,
  PatrolPointModel,
} from "./types";
import { type CubeAuth, CubeGateway } from "@ghcloud/cube-gateway";
import { BASE_API } from "@ghcloud/cube-protocol";
const baseURL = `${BASE_API}/tag`;

/** 业务标签接口 */
export class CubeBusinessTagService {
  private readonly gateway: CubeGateway;
  public constructor(auth: CubeAuth) {
    this.gateway = new CubeGateway(auth);
  }

  /** 获取标签树列表 */
  public async getTagTreeList(payload: { name?: string | undefined; period?: string | undefined }): Promise<BusinessTagModel[]> {
    const url = `${baseURL}/business-tag/tree`;
    const resp = await this.gateway.get<BusinessTagModel[]>({ url, payload });
    return resp || [];
  }

  /** 新增业务标签 */
  public async addTag(payload: { name: string; description?: string | undefined; parentId?: string | undefined }): Promise<void> {
    const url = `${baseURL}/business-tag`;
    await this.gateway.create({ url, payload });
  }

  /** 修改业务标签 */
  public async updateTag(payload: {
    id: string;
    name: string;
    description?: string | undefined;
    parentId?: string | undefined;
  }): Promise<void> {
    const url = `${baseURL}/business-tag/${payload.id}`;
    await this.gateway.update({ url, payload });
  }

  /** 删除业务标签 */
  public async deleteTag(id: string): Promise<void> {
    const url = `${baseURL}/business-tag/${id}`;
    await this.gateway.delete({ url });
  }

  /** 业务标签详情 */
  public async getTagDetails(id: string): Promise<BusinessTagModel> {
    const url = `${baseURL}/business-tag/${id}`;
    const resp = await this.gateway.get<BusinessTagModel>({ url });
    return resp;
  }

  /** 业务标签添加关联 */
  public async addTagAssociate(payload: {
    tagId: string;
    refRequests: {
      tagRefType: string;
      refId: string;
    }[];
  }): Promise<void> {
    const url = `${baseURL}/business-tag/ref`;
    await this.gateway.create({ url, payload });
  }

  /** 根据类型查询标签关联的对象Id列表 */
  public async getTagAssociateIds(payload: { tagId: string; refType: string }): Promise<string[]> {
    const url = `${baseURL}/business-tag/${payload.tagId}/ref-ids`;
    const resp = await this.gateway.get<string[]>({ url, payload });
    return resp || [];
  }

  /** 删除关联 */
  public async deleteTagAssociateIds(payload: { tagId: string; refIds: string[] }): Promise<void> {
    const url = `${baseURL}/business-tag/ref/remove`;
    await this.gateway.create({ url, payload });
  }

  /** 查询标签区域列表树形信息 */
  public async getTagAreaTreeList(payload: { tagIds?: string[]; name?: string | undefined; ids?: string[] }): Promise<AreaModel[]> {
    const url = `${baseURL}/business-tag/ref/area`;
    const resp = await this.gateway.create<AreaModel[]>({ url, payload });
    return resp || [];
  }

  /** 获取标签关联的档位分页信息 */
  public async getTagStallPageList(payload: {
    pageNumber: number;
    pageSize: number;
    tagIds?: string[];
    name?: string | undefined;
    ids?: string[];
  }): Promise<PageResult<StallModel>> {
    const url = `${baseURL}/business-tag/ref/stall`;
    const resp = await this.gateway.create<PageResult<StallModel>>({ url, payload });
    return resp;
  }

  /** 获取标签关联的设备分页信息 */
  public async getTagDevicePageList(payload: {
    pageNumber: number;
    pageSize: number;
    tagIds?: string[];
    name?: string | undefined;
    ids?: string[];
  }): Promise<PageResult<DeviceModel>> {
    const url = `${baseURL}/business-tag/ref/device`;
    const resp = await this.gateway.create<PageResult<DeviceModel>>({ url, payload });
    return resp;
  }

  /** 获取标签关联的现场点分页信息 */
  public async getTagSitePointPageList(payload: {
    pageNumber: number;
    pageSize: number;
    tagIds?: string[];
    name?: string | undefined;
    ids?: string[];
  }): Promise<PageResult<SitePointModel>> {
    const url = `${baseURL}/business-tag/ref/scene-point`;
    const resp = await this.gateway.create<PageResult<SitePointModel>>({ url, payload });
    return resp;
  }

  /** 获取标签关联的资产分页信息 */
  public async getTagPropertyPageList(payload: {
    pageNumber: number;
    pageSize: number;
    tagIds?: string[];
    name?: string | undefined;
    ids?: string[];
  }): Promise<PageResult<PropertyModel>> {
    const url = `${baseURL}/business-tag/ref/property-detailed`;
    const resp = await this.gateway.create<PageResult<PropertyModel>>({ url, payload });
    return resp;
  }

  /** 获取标签关联的风险源分页信息 */
  public async getTagRiskSourcePageList(payload: {
    pageNumber: number;
    pageSize: number;
    tagIds?: string[];
    name?: string | undefined;
    ids?: string[];
  }): Promise<PageResult<RiskSourceModel>> {
    const url = `${baseURL}/business-tag/ref/risk-source`;
    const resp = await this.gateway.create<PageResult<RiskSourceModel>>({ url, payload });
    return resp;
  }

  /** 获取标签关联的小散工程分页信息 */
  public async getTagSmallEngineeringPageList(payload: {
    pageNumber: number;
    pageSize: number;
    tagIds?: string[];
    name?: string | undefined;
    ids?: string[];
  }): Promise<PageResult<SmallEngineeringModel>> {
    const url = `${baseURL}/business-tag/ref/project-schedule`;
    const resp = await this.gateway.create<PageResult<SmallEngineeringModel>>({ url, payload });
    return resp;
  }

  /** 获取标签关联的巡更点分页信息 */
  public async getTagPatrolPointPageList(payload: {
    pageNumber: number;
    pageSize: number;
    tagIds?: string[];
    name?: string | undefined;
    ids?: string[];
  }): Promise<PageResult<PatrolPointModel>> {
    const url = `${baseURL}/business-tag/ref/patrol-point`;
    const resp = await this.gateway.create<PageResult<PatrolPointModel>>({ url, payload });
    return resp;
  }

  /** 获取标签关联所有对象信息 */
  public async getTagAllObjectData(payload: { name?: string | undefined; targetType?: string | undefined; tagIds?: string[] }): Promise<
    {
      targetId: string;
      targetName: string;
      typeId: string;
      targetType: string;
      tagIds: string;
      tagNames: string;
    }[]
  > {
    const url = `${baseURL}/business-tag/ref/data`;
    const resp = await this.gateway.create<
      {
        targetId: string;
        targetName: string;
        typeId: string;
        targetType: string;
        tagIds: string;
        tagNames: string;
      }[]
    >({ url, payload });
    return resp;
  }
}
