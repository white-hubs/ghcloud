import { type CubeAuth, CubeGateway, type LegacyServiceError } from '@ghcloud/cube-gateway'
import { BASE_API } from '@ghcloud/cube-protocol'
import type { AdminDictionaryByItem, CascadeDictionaryItem } from './type'

const baseURL = `${BASE_API}/dictionary`

export interface GetDictionaryByItem {
  id: string;
  name: string;
  code: string;
  remarks: string;
  version: string;
  flag: boolean;
  variable: string;
  itemCode: string; // 字典项编码
  userId?: string | number;
}
export enum QueryType {
  ALL = 'ALL',
  PERSONAL = 'PERSONAL'
}
/** 字典服务 */
export class CubeDictionaryService {
  private readonly gateway: CubeGateway

  public constructor (auth?: CubeAuth) {
    this.gateway = new CubeGateway(auth)
  }

  /** 根据字典项编码查询字典值 */
  public async getDictionaryByItem (payload: {
    itemCode: string;
    name?: string;
    code?: string;
    tenant?: string | undefined;
  }): Promise<GetDictionaryByItem[]> {
    const url = `${baseURL}/getDataDictionaryByItem`
    const headers = payload.tenant ? { headers: { tenant: payload.tenant } } : {}
    const resp = await this.gateway.custom<LegacyServiceError<GetDictionaryByItem[]>>({
      url,
      query: payload,
      method: 'GET',
      ...headers
    })
    return resp?.data || resp
  }

  /** 根据字典项编码查询字典值 (admin) 不限制租户 */
  public async getAdminDictionaryByItem (payload: {
    itemCode: string;
    name?: string;
    code?: string;
    tenant?: string | undefined;
    codes?: string[];
    disable?: boolean;
  }): Promise<AdminDictionaryByItem[]> {
    const url = `${baseURL}/admin/getDataDictionaryByItem`
    const resp = await this.gateway.custom<LegacyServiceError<AdminDictionaryByItem[]>>({
      url,
      query: payload,
      method: 'GET',
    })
    return resp?.data || resp
  }

  public async getDictionaryItemByCode (payload: {
    code: string;
  }): Promise<GetDictionaryByItem[]> {
    const url = `${baseURL}/getDictionaryItemByCode/${payload.code}`
    const resp = await this.gateway.get<LegacyServiceError<GetDictionaryByItem[]>>({ url })
    return resp?.data || resp
  }

  /** 根据字典项编码查询字典树 */
  public async getDictionaryTree (payload: {
    itemCode?: string;
    id?: string;
    disable?: boolean;
  }): Promise<CascadeDictionaryItem[]> {
    const url = `${baseURL}/getCascadeDictionaryItem`
    const resp = await this.gateway.get< LegacyServiceError<CascadeDictionaryItem[]>>({ url, payload })
    return resp?.data || resp
  }

  /**
 * 根据id查询字典详情
 */
  public async getDataDictionaryById (payload: {
    id: string;
  }): Promise<CascadeDictionaryItem> {
    const url = baseURL + `/getDataDictionaryById/${payload.id}`
    const resp = await this.gateway.get< LegacyServiceError<CascadeDictionaryItem>>({ url, payload })
    return resp?.data || resp
  }

  /** 添加字典项 */
  public async addDataDictionaryItem (payload: {
    code: string;
    remarks?: string;
  }): Promise<unknown> {
    const url = `${baseURL}/addDictionaryItem`
    const resp = await this.gateway.create< LegacyServiceError<unknown>>({ url, payload })
    return resp?.data || resp
  }

  /** 添加字典 */
  public async addDataDictionary (payload: {
    itemCode: string;
    name?: string;
    code?: string;
    variable?: string;
    tenant?: string | undefined;
  }): Promise<unknown> {
    const url = `${baseURL}/addDataDictionary`
    const headers = payload.tenant ? { headers: { tenant: payload.tenant } } : {}
    const resp = await this.gateway.custom<LegacyServiceError<unknown[]>>({
      url,
      payload,
      method: 'POST',
      ...headers
    })
    return resp?.data || resp
  }

  /** 修改字典 */
  public async updateDataDictionary (
    payload: {
      id: string;
      itemCode?: string;
      name: string;
      code?: string;
      variable?: string;
      remarks?: string;
      version?: string;
      tenant?: string | undefined;
    }
  ): Promise<unknown> {
    const url = `${baseURL}/updateDataDictionary`
    const headers = payload.tenant ? { headers: { tenant: payload.tenant } } : {}
    const resp = await this.gateway.custom<LegacyServiceError<unknown>>({
      url,
      payload,
      method: 'PUT',
      ...headers
    })
    return resp?.data || resp
  }

  /** 删除字典 */
  public async deleteDataDictionary (payload: {
    id: string;
    tenant?: string | undefined;
  }): Promise<void> {
    const url = `${baseURL}/deleteDataDictionary/${payload.id}`
    const headers = payload.tenant ? { headers: { tenant: payload.tenant } } : {}
    await this.gateway.custom<LegacyServiceError<unknown>>({
      url,
      method: 'DELETE',
      ...headers
    })
  }

  /** 新增用户字典 */
  public async addUserDictionary (payload: {
    itemCode: string;
    name?: string;
    code?: string;
    variable?: string;
  }): Promise<unknown> {
    const url = `${baseURL}/user-dictionary/add`
    const resp = await this.gateway.create<LegacyServiceError<unknown[]>>({
      url,
      payload,
    })
    return resp?.data || resp
  }

  /** 修改用户字典 */
  public async updateUserDictionary (
    payload: {
      id: string;
      itemCode?: string;
      name?: string;
      code?: string;
      variable?: string;
      remarks?: string;
      version?: string;
    }
  ): Promise<void> {
    const url = `${baseURL}/user-dictionary/update`
    await this.gateway.update({
      url,
      payload,
    })
  }

  /** 删除用户字典 */
  public async deleteUserDictionary (id: string): Promise<void> {
    const url = `${baseURL}/user-dictionary/delete/${id}`
    await this.gateway.delete({ url })
  }

  /** 根据字典项编码查询字典值 用户 */
  public async getUserDictionaryList (payload: {
    itemCode: string;
    name?: string;
    code?: string;
    queryType?: QueryType;
  }): Promise<GetDictionaryByItem[]> {
    const url = `${baseURL}/user-dictionary/list`
    const resp = await this.gateway.get<GetDictionaryByItem[]>({
      url,
      payload,
    })
    return resp
  }

  /** 批量新增字典 */
  public async batchUserDictionaryAddOrUpdate (payload: {
    code?: string;
    id?: number;
    itemCode: string;
    name: string;
    remarks?: string;
    status?: string;
    userId?: number;
    variable?: string;
    version?: string;
  }[]): Promise<unknown> {
    const url = `${baseURL}/user-dictionary/add/or/update/batch`
    const resp = await this.gateway.create<LegacyServiceError<unknown>>({ url, payload })
    return resp?.data || resp
  }

  /** 根据字典项编码查询字典值 */
  public async getSysDictionaryByItem (payload: {
    itemCode: string;
    name?: string;
    code?: string;
  }): Promise<GetDictionaryByItem[]> {
    const url = `${baseURL}/getSysDictionaryByItem`
    const resp = await this.gateway.get<GetDictionaryByItem[]>({
      url,
      payload,
    })
    return resp
  }

  public async getSysDictionaryByCodeAndItemCode (payload: {
    itemCode: string,
    code: string
  }): Promise<GetDictionaryByItem> {
    const url = `${baseURL}/getSysDictionaryByCodeAndItemCode`
    const resp = await this.gateway.get<LegacyServiceError<GetDictionaryByItem>>({
      url,
      payload,
    })
    return resp?.data || resp
  }
}
