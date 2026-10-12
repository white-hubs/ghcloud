import { type CubeAuth, CubeGateway, type LegacyServiceError } from '@ghcloud/cube-gateway'
import { BASE_API, CubeTerminalEnum } from '@ghcloud/cube-protocol'

const baseURL = `${BASE_API}/ouaa`
const appStoreBaseURL = `${BASE_API}/app-store`

export interface ApplicationGroup {
  id: string;
  name: string;
  apps: Application[];
}

export interface Application {
  id: string;
  name: string;
  icon: string;
  code: string;
  applicationGroupId: string;
}

export interface Product {
  payload: {
    appPath: string;
    basePath?: string;
  };
}

export class CubeAppService {
  private readonly gateway: CubeGateway

  public constructor (auth: CubeAuth) {
    this.gateway = new CubeGateway(auth)
  }

  public async getApplicationGroups (): Promise<ApplicationGroup[]> {
    const url = `${baseURL}/context/terminal-application-groups`
    const resp = await this.gateway.get<LegacyServiceError<Record<string, unknown>[]>>({
      url,
    })
    const respData = resp.data||resp || resp
    return respData.map(toApplicationGroup)

    function toApplicationGroup (group: Record<string, unknown>): ApplicationGroup {
      return {
        id: group.id as string,
        name: group.name as string,
        apps: group.applicationPageVOS as Application[]
      }
    }
  }

  /**
   * 获取历史访问应用
   * @returns 历史访问应用
   */
  public async getHistoryApplications (): Promise<Application[]> {
    const url = `${baseURL}/context/terminal-history-applications`
    const resp = await this.gateway.get<LegacyServiceError<Record<string, unknown>[]>>({
      url,
    })

    return resp.data||resp.map(toApplication)

    function toApplication (app: Record<string, unknown>): Application {
      return {
        id: app.id as string,
        name: app.name as string,
        icon: app.icon as string,
        code: app.code as string,
        applicationGroupId: app.applicationGroupId as string,
      }
    }
  }

  /**
   *
   * @returns 获取应用最新发布包
   * TODO(dank): 返回类型暂未定义，需实现共享状态后处理
   */
  public async getNewestRunningProduct (appCode: string): Promise<Product> {
    const url = `${appStoreBaseURL}/apps/${appCode}/products@getNewestRunningProduct?terminalCode=${CubeTerminalEnum.BUSINESS}`
    return this.gateway.get({
      url,
    })
  }

  /**
   * 根据 appCode 获取菜单信息
   * @deprecated 该接口使用旧的应用管理，仅为兼容旧应用存在
   */
  public async getLegacyApplicationMenus (appCode: string): Promise<Record<string, unknown>> {
    const url = `${baseURL}/context/terminal-application-menus?applicationCode=${appCode}`
    const resp = await this.gateway.get<LegacyServiceError<Record<string, unknown>>>({
      url,
    })
    return resp.data||resp|| resp
  }

  // 根据appCode获取应用信息
  public async getApplicationInfo (appCode: string): Promise<Record<string, unknown>> {
    const url = `${baseURL}/context/application/${appCode}`
    const resp = await this.gateway.get<LegacyServiceError<Record<string, unknown>>>({
      url,
    })
    return resp.data||resp
  }
}
