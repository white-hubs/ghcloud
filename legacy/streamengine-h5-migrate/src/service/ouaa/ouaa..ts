import { Position, Dept } from '../../domain/ouaa'
import { getApiBaseUrL, getAuthHeaders } from '@ghcloud/cube-app-js-sdk'
import { HTTPClientImpl } from '../../infrastructure/http-client'
import { BaseAPIResult } from '../base-api'
import { OuaaUser } from '../../domain/user'
interface UsersPage {
  total: number;
  records: OuaaUser[];
  pages: number;
}
class OuaaService {
  private readonly client = new HTTPClientImpl({
    baseURL: getApiBaseUrL()??'/api',
    headers: getAuthHeaders()
  })

  /**
   *
   * @param params name 职位名称 enabled 是否启用
   * @returns 职位列表
   */
  public async getPositionList (params?: Record<string, string | number | boolean>): Promise<Position[]> {
    const result = await this.client.get<Position[]>('/ouaa/authenticated/position/list', { query: params })
    return result
  }

  /**
   * @param params name 职位名称 enabled 是否启用 pageSize pageNumber
   * @returns 岗位列表
   */
  public async getAppointmentList (params?: Record<string, string | number | boolean>): Promise<{records:{id:string,name:string}[]}> {
    const result = await this.client.get<{records:{id:string,name:string}[]}>('/ouaa/appointment/page', { query: params })
    return result
  }

  /**
   * @returns 部门列表
   */
  public async getDeptList (params?: Record<string, string | number | boolean>): Promise<Dept[]> {
    const result = await this.client.get<Dept[]>('/ouaa/authenticated/organizations/list', { query: params })
    return result
  }

  /**
   * @returns 员工列表
   */
  public async getUserList (params: { pageNumber: number;pageSize: number;keyword?: string; organizationId?: string; workStatus?: string;enabled:boolean }): Promise<UsersPage> {
    const result = await this.client.get<UsersPage>('/ouaa/authenticated/user-under-tenant/page', { query: params })
    return result
  }

  /**
   * @returns 获取当前租户开通的子应用
   */
  public async getApplicationList (): Promise<{code:string}[]> {
    const { tenant } = getAuthHeaders()
    const result = await this.client.get<{code:string}[]>(`/ouaa/tenant-under-tenant/${tenant}/product-applications`)
    return result
  }
}

export const ouaaService = new OuaaService()
