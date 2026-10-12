import { type CubeAuth, CubeGateway, LegacyServiceError } from '@ghcloud/cube-gateway'
import { BASE_API } from '@ghcloud/cube-protocol'
import type { PageResult, PersonCategory } from './types'
const baseURL = `${BASE_API}/personnel`

export class CubePersonnelManagementService {
  private readonly gateway: CubeGateway

  public constructor (auth: CubeAuth) {
    this.gateway = new CubeGateway(auth)
  }

  /**
   * 分页获取人员分类列表
   */
  public async getPersonnelCategoryList (payload: {
    pageNumber: number;
    pageSize: number;
    name: string;
  }): Promise<PageResult<PersonCategory>> {
    const url = `${baseURL}/staff-type/page`
    return this.gateway.get<PageResult<PersonCategory>>({ url, payload })
  }

  /**
   * 获取人员类型列表
   */
  public async getPersonnelCategoryListAll (): Promise<PersonCategory[]> {
    const url = `${baseURL}/staff-type/list`
    return this.gateway.get<PersonCategory[]>({ url })
  }

  /**
   * 新增人员分类
   */
  public async createOrUpdatePersonnelCategory (payload: {
    id?: string;
    name: string;
    remark: string;
  }): Promise<unknown> {
    const url = `${baseURL}/staff-type/save-or-update`
    return this.gateway.create<unknown>({ url, payload })
  }

  /**
   * 删除人员分类
   */
  public async deletePersonnelCategory (payload: {
    id: string;
  }): Promise<unknown> {
    const url = `${baseURL}/staff-type/delete?id=${payload.id}`
    return this.gateway.delete({ url })
  }

  /**
   * 人事管理流程发起
   */
  public async personnelFlowSubmit (payload: Record<string, unknown>): Promise<string> {
    const url = `${baseURL}/personnel/submit`
    const response = await this.gateway.create<string>({ url, payload })
    return response;
  }

  // 用户导出
  public async getPersonnelUsersExcel (payload?: {
    keyword?: string | undefined;
    pageNumber?: number | undefined;
    pageSize?: number | undefined;
    type?: string | undefined;
  }): Promise<Blob> {
    const url = `${baseURL}/user-center/users/export`
    const res = await this.gateway.customBlob({ method: 'GET', url, payload })
    return res
  }
}
