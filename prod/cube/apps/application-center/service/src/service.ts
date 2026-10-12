import { type CubeAuth, CubeGateway, LegacyServiceError } from '@ghcloud/cube-gateway'
import { BASE_API } from '@ghcloud/cube-protocol'
import { PageResult, TerminalEntity, ApplicationEntity, ApplicationTypeEntity, ApplicationIterationEntity } from './types'

const baseURL = `${BASE_API}/ouaa`

export class CubeApplicationCenterService {
  private readonly gateway: CubeGateway
  public constructor (auth: CubeAuth) {
    this.gateway = new CubeGateway(auth)
  }

  /** 管理端-客户端列表分页 */
  public async getTerminals (payload?: {
    keyword?: string;
    pageNumber?: number;
    pageSize?: number;
  }): Promise<PageResult<TerminalEntity>> {
    const url = `${baseURL}/terminals`
    const resp = await this.gateway.get<PageResult<TerminalEntity>>({ url, payload })
    return resp
  }

  /** 管理端-应用端-新增 */
  public async addTerminal (payload: {
    name: string;
    code: string;
    remark?: string;
  }): Promise<string> {
    const url = `${baseURL}/terminals`
    const resp = await this.gateway.create<string>({ url, payload })
    return resp
  }

  /** 管理端-应用端-修改 */
  public async updateTerminal (payload: {
    id: string;
    name: string;
    code: string;
    remark?: string;
  }): Promise<string> {
    const url = `${baseURL}/terminal/${payload.id}`
    const resp = await this.gateway.update<string>({ url, payload })
    return resp
  }

  /** 管理端-应用端-移除 */
  public async deleteTerminal (id: string): Promise<void> {
    const url = `${baseURL}/terminal/${id}`
    const resp = await this.gateway.delete({ url })
    return resp
  }

  /** 管理端-应用列表 */
  public async getApplications (payload?: {
    keyword?: string;
    enabled?: boolean;
  }): Promise<ApplicationEntity[]> {
    const url = `${baseURL}/application/list/selection`
    const resp = await this.gateway.get<ApplicationEntity[]>({ url, payload })
    return resp
  }

  /** 管理端-应用列表分页 */
  public async getApplicationPage (payload?: {
    keyword?: string;
    pageNumber?: number;
    pageSize?: number;
    applicationGroupId?: string;
    enabled?: boolean;
  }): Promise<PageResult<ApplicationEntity>> {
    const url = `${baseURL}/applications`
    const resp = await this.gateway.get<PageResult<ApplicationEntity>>({ url, payload })
    return resp
  }

  /** 应用中心-应用列表 */
  public async getMarketApplications (payload?: {
    keyword?: string;
    applicationGroupId?: string;
  }): Promise<ApplicationEntity[]> {
    const url = `${baseURL}/public/app-market-list`
    const resp = await this.gateway.get<ApplicationEntity[]>({ url, payload })
    return resp
  }

  /** 应用中心-推荐应用 */
  public async getRecommendApplications (payload?: {
    applicationId?: string;
    applicationGroupId?: string;
  }): Promise<ApplicationEntity[]> {
    const url = `${baseURL}/public/application/recommend`
    const resp = await this.gateway.get<ApplicationEntity[]>({ url, payload })
    return resp
  }

  /** 我的应用 */
  public async getMyApplications (payload?: {
    keyword?: string;
    pageNumber?: number;
    pageSize?: number;
    applicationGroupId?: string;
    enabled?: boolean;
  }): Promise<PageResult<ApplicationEntity>> {
    const url = `${baseURL}/application/my`
    const resp = await this.gateway.get<PageResult<ApplicationEntity>>({ url, payload })
    return resp
  }

  /** 应用信息 */
  public async getApplication (id: string): Promise<ApplicationEntity> {
    const url = `${baseURL}/application/${id}`
    const resp = await this.gateway.get<ApplicationEntity>({ url })
    return resp
  }

  /** 管理端-应用信息-新增 */
  public async addApplication (payload: {
      code: string;
      name: string;
      icon: string;
      enabled: boolean;
      applicationGroupId: string;
      createTime: string;
      updateTime: string;
      version: string;
      viewCount: number;
      dependAppIds: string;
      terminalIdList: string[];
      remark: string;
      extendParam: {
        description: string;
        featureDesc: string;
        helpInfo: string;
        purchaseInfo: string;
        title: string;
        keywords: string;
        appDesc: string;
      };
    }): Promise<boolean> {
    const url = `${baseURL}/application`
    const resp = await this.gateway.create<boolean>({ url, payload })
    return resp
  }

  /** 管理端-应用信息-修改 */
  public async updateApplication (payload: {
      id: string;
      code: string;
      name: string;
      icon: string;
      enabled: boolean;
      applicationGroupId: string;
      createTime: string;
      updateTime: string;
      version: string;
      viewCount: number;
      dependAppIds: string;
      terminalIdList: string[];
      remark: string;
      extendParam: {
        description: string;
        featureDesc: string;
        helpInfo: string;
        purchaseInfo: string;
        title: string;
        keywords: string;
        appDesc: string;
      };
    }): Promise<boolean> {
    const url = `${baseURL}/application/${payload.id}`
    const resp = await this.gateway.update<boolean>({ url, payload })
    return resp
  }

  /** 管理端-应用信息-批量修改 */
  public async batchUpdateApplication (payload: {
    applicationIds: string[];
    applicationGroupId?: string;
    enabled?: boolean;
    publicAccess?: boolean;
  }): Promise<ApplicationEntity> {
    const url = `${baseURL}/application/batch`
    const resp = await this.gateway.update<ApplicationEntity>({ url, payload })
    return resp
  }

  /** 管理端-应用分类分页 */
  public async getApplicationTypePage (payload?: {
    keyword?: string;
    pageNumber?: number;
    pageSize?: number;
  }): Promise<PageResult<ApplicationTypeEntity>> {
    const url = `${baseURL}/application-groups`
    const resp = await this.gateway.get<PageResult<ApplicationTypeEntity>>({ url, payload })
    return resp
  }

  /** 管理端-应用分类列表 */
  public async getApplicationTypeList (payload?: {
    keyword?: string;
  }): Promise<ApplicationTypeEntity[]> {
    const url = `${baseURL}/application-group/list/selection`
    const resp = await this.gateway.get<ApplicationTypeEntity[]>({ url, payload })
    return resp
  }

  /** 管理端-应用类型-新增 */
  public async addApplicationType (payload: {
    name: string;
    remark?: string;
  }): Promise<string> {
    const url = `${baseURL}/application-group`
    const resp = await this.gateway.create<string>({ url, payload })
    return resp
  }

  /** 管理端-应用类型-修改 */
  public async updateApplicationType (payload: {
    id: string;
    name: string;
    remark?: string;
  }): Promise<string> {
    const url = `${baseURL}/application-group/${payload.id}`
    const resp = await this.gateway.update<string>({ url, payload })
    return resp
  }

  /** 管理端-应用类型-移除 */
  public async deleteApplicationType (id: string): Promise<void> {
    const url = `${baseURL}/application-group/${id}`
    const resp = await this.gateway.delete({ url })
    return resp
  }

  /** 管理端-应用迭代记录-分页 */
  public async getApplicationIterationPage (payload?: {
    keyword?: string;
    pageNumber?: number;
    pageSize?: number;
    applicationId?: string;
  }): Promise<PageResult<ApplicationIterationEntity>> {
    const url = `${baseURL}/application/iteration/record/get`
    const resp = await this.gateway.get<PageResult<ApplicationIterationEntity>>({ url, payload })
    return resp
  }

  /** 管理端-应用迭代-详情 */
  public async getApplicationIterationDetails (id: string): Promise<ApplicationIterationEntity> {
    const url = `${baseURL}/application/iteration/record/get/detail`
    const resp = await this.gateway.get<ApplicationIterationEntity>({ url, payload: { id } })
    return resp
  }

  /** 管理端-应用迭代-新增/修改 */
  public async updateApplicationIterationDetails (payload: {
    id?: string;
    applicationId: string;
    version: string;
    lastVersion: string;
    contentList: {
      iterationId?: string;
      category: string;
      content: string;
    }[];
  }): Promise<boolean> {
    const url = `${baseURL}/application/iteration/record/save/or/update`
    const resp = await this.gateway.create<boolean>({ url, payload })
    return resp
  }

}
