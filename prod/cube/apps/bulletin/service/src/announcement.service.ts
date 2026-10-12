import { type CubeAuth, CubeGateway, type LegacyServiceError, type Pagination } from '@ghcloud/cube-gateway'
import { BASE_API } from '@ghcloud/cube-protocol'

const baseURL = `${BASE_API}/management`
export interface NoticeConfigCommand {
  way: string | string[];
  personnelType: string;
  deptIds: string[];
  postIds: string[];
  roleIds: string[];
  userIds: string[];
}

export interface NoticeInfoAdd {
  type: string;
  level: string;
  title: string;
  tagId?: string;
  publishAgency?: string;
  content: string;
  noticeConfigCommands?: NoticeConfigCommand[];
  fileIds?: string[];
}
export interface File {
  id: string;
  name: string;
  suffix: string;
  path: string;
  size?: number;
  refCount: number;
  type: string;
  businessKey?: string;
}

export interface AnnouncementDetail {
  id: string;
  title: string;
  type: string;
  level: string;
  levelName: string;
  content: string;
  noticeTime: string;
  createBy: string;
  typeName: string;
  noticeConfigs: string[];
  files: File[];
}

/** 资讯公共list */
export interface InformationList {
  /**
     * 发布时间
     */
  createTime: null | string;
  fileVOS: File[] | null;
  id: string;
  /**
       * 发布机构
       */
  publishAgency: null | string;
  /**
       * 公告标签
       */
  tagName: null | string;
  title: null | string;
  content: string;
}

/** 资讯 公告 接口响应 */
export interface InformationPageResponse {
  /**
     * countId
     */
  countId?: null | string;
  /**
    * 当前页
    */
  current?: number | null;
  /**
    * 是否命中count缓存
    */
  hitCount?: boolean | null;
  /**
    * 是否进行 count 查询
    */
  isSearchCount?: boolean | null;
  /**
    * countId
    */
  maxLimit?: number | null;
  /**
    * 自动优化 COUNT SQL
    */
  optimizeCountSql?: boolean | null;
  /**
    * 排序字段信息
    */
  orders?: {
    /**
    * 是否正序排列，默认 true
    */
    asc?: boolean | null;
    /**
    * 需要进行排序的字段
    */
    column?: null | string;
  }[] ;
  /**
    * 查询数据列表
    */
  records: InformationList[];
  /**
    * 每页显示条数，默认 10
    */
  size?: number | null;
  /**
    * 总数
    */
  total: number;
  pages: number;
}
export interface NoticeType {
  id: string;
  modelType: string;
  typeName: string;
  oneLevelType: string;
}
export class CubeAnnouncementService {
  private readonly gateway: CubeGateway

  public constructor (auth: CubeAuth) {
    this.gateway = new CubeGateway(auth)
  }

  public async listAnnouncement (query: {
    pageNumber: number;
    pageSize: number;
    status?: string;
    keyword?: string;
    type?: string;
    level?: string;
    period?: string;
  }): Promise<Pagination<Record<string, unknown>>> {
    const url = `${baseURL}/announcement/page`
    const resp = await this.gateway.get<LegacyServiceError<Record<string, unknown>>>({ url, payload: { ...query } })
    return toPagination(resp.data ||resp)
 
    function toPagination (result: Record<string, unknown>): Pagination<Record<string, unknown>> {
      return {
        total: result.total as number,
        pages: result.pages as number,
        currentPage: result.current as number,
        pageSize: result.size as number,
        records: result.records as Record<string, unknown>[]
      }
    }
  }

  public async announcementDetail (id: string): Promise<AnnouncementDetail> {
    const url = `${baseURL}/announcement/${id}`
    const resp = await this.gateway.get<LegacyServiceError<AnnouncementDetail>>({ url })
    return resp.data ||resp
  }

  public async noticeType (payload?: {
    keyword?: string;
  }): Promise<NoticeType[]> {
    const url = `${baseURL}/getList/ANNOUNCEMENT`
    const resp = await this.gateway.get<LegacyServiceError<NoticeType[]>>({ url, payload })
    return resp.data ||resp
  }

  // 公告类型新增
  public async noticeTypeAdd (params: {
    oneLevelType: string;
    typeName: string;
    modelType: string;
  }): Promise<Record<string, string[]>> {
    const url = `${baseURL}/addModelTypeCommand`
    const res = await this.gateway.create<LegacyServiceError<Record<string, string[]>>>({ url, payload: params })
    return res.data||res
  }

  // 公告修改-置顶、隐藏
  public async updateHideTop (params: {
    isTopping: boolean;
    status: string;
    id: string;
  }[]): Promise<Record<string, string[]>> {
    const url = `${baseURL}/announcement/update/hide-top`
    const res = await this.gateway.create<LegacyServiceError<Record<string, string[]>>>({ url, payload: params })
    return res.data||res
  }

  // 公告信息删除
  public async noticeInfoBatch (id: string): Promise<void> {
    const url = `${baseURL}/announcement/${id}`
    this.gateway.delete({ url })
  }

  // 公告信息删除
  public async noticeInfoDeleteBatch (ids: string): Promise<void> {
    const url = `${baseURL}/announcement/bath?ids=${ids}`
    this.gateway.delete({ url })
  }

  // 公告类型编辑
  public async noticeTypeId (params: {
    oneLevelType: string;
    typeName: string;
    modelType: string;
  }, id: string): Promise<Record<string, string[]>> {
    const url = `${baseURL}/updateModelTypeCommand/${id}`
    const res = await this.gateway.update<LegacyServiceError<Record<string, string[]>>>({ url, payload: params })
    return res.data||res
  }

  public async noticeLevel (): Promise<{ name: string;code: string; }[]> {
    const url = `${baseURL}/getAnnouncementLevels`
    const resp = await this.gateway.get<LegacyServiceError<{ name: string;code: string; }[]>>({ url })
    return resp.data ||resp
  }

  // 公告标签列表
  public async noticeLabel (payload?: { keyword: string; }): Promise<NoticeType[]> {
    const url = `${baseURL}/getList/ANNOUNCEMENT_TAG`
    const resp = await this.gateway.get<LegacyServiceError<NoticeType[]>>({ url, payload })
    return resp.data ||resp
  }

  // 公告标签新增
  public async noticeLabelAdd (params: {
    typeName: string;
    modelType: string;
  }): Promise<Record<string, string[]>> {
    const url = `${baseURL}/addModelTypeCommand`
    const res = await this.gateway.create<LegacyServiceError<Record<string, string[]>>>({ url, payload: params })
    return res.data||res
  }

  // 公告标签列表
  public async noticeInstitution (payload?: { keyword?: string; }): Promise<NoticeType[]> {
    const url = `${baseURL}/getList/PUBLISH_AGENCY`
    const resp = await this.gateway.get<LegacyServiceError<NoticeType[]>>({ url, payload })
    return resp.data ||resp
  }

  // 部门列表
  public async deptList (payload: { name: string;pageSize: number;pageNumber: number; }): Promise<Record<string, unknown>[]> {
    const url = `${BASE_API}/ouaa/authenticated/organizations/list`
    const res = await this.gateway.get<LegacyServiceError<Record<string, unknown>[]>>({ url, payload })
    return res.data||res
  }

  // 职位列表
  public async positionList (payload: { name: string;pageSize: number;pageNumber: number; }): Promise<{ total: number;records: Record<string, unknown>[]; pages: number; }> {
    const url = `${BASE_API}/ouaa/authenticated/positions`
    const res = await this.gateway.get<LegacyServiceError<{ total: number;records: Record<string, unknown>[]; pages: number; }>>({ url, payload })
    return res.data||res
  }

  // 角色列表
  public async getRoleList (payload: { name: string;pageSize: number;pageNumber: number; }): Promise<{ total: number;records: Record<string, unknown>[]; pages: number; }> {
    const url = `${BASE_API}/ouaa/authenticated/product/role/page`
    const res = await this.gateway.get<LegacyServiceError<{ total: number;records: Record<string, unknown>[]; pages: number; }>>({ url, payload })
    return res.data||res
  }

  // 用户列表
  public async tenantUsers (payload: { name: string;pageSize: number;pageNumber: number; }): Promise<{ total: number;records: Record<string, unknown>[]; pages: number; }> {
    const url = `${BASE_API}/ouaa/authenticated/user-under-tenant/page`
    const res = await this.gateway.get<LegacyServiceError<{ total: number;records: Record<string, unknown>[]; pages: number; }>>({ url, payload })
    return res.data||res
  }

  // 发布机构新增
  public async noticeInstitutionAdd (params: {
    typeName: string;
    modelType: string;
  }): Promise<Record<string, string[]>> {
    const url = `${baseURL}/addModelTypeCommand`
    const res = await this.gateway.create<LegacyServiceError<Record<string, string[]>>>({ url, payload: params })
    return res.data||res
  }

  // 公告信息新增
  public async noticeInfoAdd (params: {
    type: string;
    level: string;
    title: string;
    tagId?: string;
    publishAgency?: string;
    content: string;
    noticeConfigCommands?: NoticeConfigCommand[];
    fileIds?: string[];
  }): Promise<Record<string, string[]>> {
    const url = `${baseURL}/announcement`
    const res = await this.gateway.create<LegacyServiceError<Record<string, string[]>>>({ url, payload: params })
    return res.data||res
  }

  // 公告标签修改
  public async noticeLabelId (params: {
    typeName: string;
    modelType: string;
  }, id: string): Promise<Record<string, string[]>> {
    const url = `${baseURL}/updateModelTypeCommand/${id}`
    const res = await this.gateway.update<LegacyServiceError<Record<string, string[]>>>({ url, payload: params })
    return res.data||res
  }

  // 类型删除
  public async removeModelType (id: string): Promise<void> {
    const url = `${baseURL}/removeModelType/${id}`
    await this.gateway.delete({ url })
  }

  /** 公共接口 查资讯和公共 */
  public async publicInformationList (query: {
    pageSize: number;
    pageNumber: number;
    keyword: string;
    status: 'HIDE' | 'DISPLAY';
    informationType: 'ANNOUNCEMENT' | 'NEW_INFORMATION';
  }): Promise<InformationPageResponse> {
    const url = `${baseURL}/public/information/list`
    const resp = await this.gateway.get<LegacyServiceError<InformationPageResponse>>({ url, payload: { ...query } })
    return resp.data ||resp
  }

  /** 公共接口 查详情 */
  public async getDetail (id: string): Promise<AnnouncementDetail> {
    const url = `${baseURL}/public/announcement/detail?id=${id}`
    const resp = await this.gateway.get<LegacyServiceError<AnnouncementDetail>>({ url })
    return resp.data ||resp
  }
}
