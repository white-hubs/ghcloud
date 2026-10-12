import { ConsumableStoreStock, PropertyDetailedParam } from '../../domain/property'
import { getApiBaseUrL, getAuthHeaders } from '@ghcloud/cube-app-js-sdk'
import { HTTPClientImpl } from '../../infrastructure/http-client'
import { BaseAPIResult } from '../base-api'

class PropertyService {
  private readonly client = new HTTPClientImpl({
    baseURL: getApiBaseUrL()??'/api',
    headers: getAuthHeaders()
  })

  // 获取资产分类
  public async getAssemblyClassify (params: {
    type: 'assetType' | 'depository' | 'assetSource' | 'reasonForScrapping';
    pageSize?: number;
    pageNumber?: number;
  }): Promise<AssemblyClassify> {
    params.pageSize = 1000
    params.pageNumber = 1
    const result = await this.client.get<AssemblyClassify>('/property/classify/getAssemblyClassifyPage', { query: params })
    return result
  }

  // 获取资产分类 树形
  public async getAssemblyClassifyTree (params: {
    type: 'assetType' | 'depository' | 'assetSource' | 'reasonForScrapping';
  }): Promise<AssemblyClassify> {
    const result = await this.client.get<AssemblyClassify>('/property/classify/getAssemblyClassifyTree', { query: params })
    return result
  }

  // 获取区域查询
  public async getAreaList (url:string='/mdata/area/list'): Promise<Array<{ id: string; name: string; }>> {
    const result = await this.client.get<Array<{ id: string; name: string; }>>(url)
    return result
  }

  // 资产列表 分页
  public async getPropertyDetailedPage (params: { pageSize: number; pageNumbe?: number; businessType?: string; receiveDepId?: string; keyword?: string; }): Promise<PropertyDetailed> {
    const result = await this.client.get<PropertyDetailed>('/property/property/detailed/getPropertyDetailedPage', { query: params })
    return result
  }

  // 仓库列表
  public async getStorehouseList (params?: { keyword?: string; }): Promise<Array<{ id: string; name: string; }>> {
    const result = await this.client.get<Array<{ id: string; name: string; }>>('/property/storehouse/list', { query: params })
    return result
  }

  // 耗材分页查询（仓库）
  public async getConsumableStoreStock (params: { pageSize: number; pageNumbe?: number; keyword?: string; storeId: string; categoryId?: string; }): Promise<ConsumableStoreStockRes> {
    const result = await this.client.get<ConsumableStoreStockRes>('/property/consumable-store-stock/page', { query: params })
    return result
  }

  // 耗材分页查询（总体）
  public async getConsumablePage (params: { pageSize: number; pageNumbe?: number; keyword?: string; storeId?: string; categoryId?: string; }): Promise<ConsumableStoreStockRes> {
    const result = await this.client.get<ConsumableStoreStockRes>('/property/consumable/page', { query: params })
    return result
  }

  // 盘点资产编码是否有重复
  public async getDuplicates (params: unknown): Promise<unknown> {
    const result = await this.client.post<unknown>('/property/property/detailed/getDuplicates', params)
    return result
  }
  //分页查询风险源台账
  public async getRiskSource (params: { pageSize: number; pageNumbe?: number; businessType?: string; receiveDepId?: string; keyword?: string; }): Promise<PropertyDetailed> {
    const result = await this.client.get<PropertyDetailed>('/property/risk/source/ledger/page', { query: params })
    return result
  }

  // 资产编辑-资产编码是否重复
  public async checkPropertyCode (params: { checkSerialNumberList: { key?: string|null; value: string; }[] }): Promise<string[]> {
    const result = await this.client.post<string[]>('/property/property/detailed/checkCodeBath', params)
    return result
  }
}

export const propertyService = new PropertyService()

interface AssemblyClassify {
  pages?: number;
  records?: AssemblyClassifyPageVO[];
  total?: number;
}

/**
* AssemblyClassifyPageVO
*/
interface AssemblyClassifyPageVO {
  createBy?: string;
  createTime?: string;
  deleted?: boolean;
  /**
   * 组件
   */
  id?: number;
  /**
   * 名称
   */
  name?: string;
  /**
   * 备注
   */
  remarks?: string;
  /**
   * 类型（资产、仓库等）
   */
  type?: string;
  updateBy?: string;
  updateTime?: string;
}

interface PropertyDetailed {
  total: number;
  records: PropertyDetailedParam[];
}

interface ConsumableStoreStockRes {
  total: number;
  records: ConsumableStoreStock[];
}