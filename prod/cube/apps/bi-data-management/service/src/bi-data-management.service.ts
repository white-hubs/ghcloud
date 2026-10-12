import { type CubeAuth, CubeGateway } from '@ghcloud/cube-gateway'
import { BASE_API } from '@ghcloud/cube-protocol'
import type { PageResult, MerchantInfoVo, RegionTreeVo, ImportResultVO, MerchantData } from './types'
const baseURL = `${BASE_API}/collection-analysis`

export class CubeBiDataManagementService {
  private readonly gateway: CubeGateway

  public constructor (auth: CubeAuth) {
    this.gateway = new CubeGateway(auth)
  }

  /**
   * 新增商户信息
   */
  public async createMerchantInfo (payload: {
    name: string;
    sex: string;
    age: number | string;
    merchantType: string;
    area?: string;
    businessScope: string;
    vehicleType?: string;
    nativePlaceIds?: string;
    upstreamSourceIds?: string;
    businessScaleNumber?: string;
  }): Promise<unknown> {
    const url = `${baseURL}/merchant-information/add`
    return this.gateway.create<unknown>({ url, payload })
  }

  /**
   * 获取商户分页列表
   */
  public async getMerchantInfoPage (payload: {
    pageNumber: number;
    pageSize: number;
    merchantType: string;
    businessScope?: string;
    vehicleType?: string;
    businessScaleScope?: string;
    name: string;
  }): Promise<PageResult<MerchantInfoVo>> {
    const url = `${baseURL}/merchant-information/page`
    return this.gateway.get<PageResult<MerchantInfoVo>>({ url, payload })
  }

  /**
   * 删除商户
   */
  public async deleteMerchantInfo (payload: {
    id: string;
  }): Promise<unknown> {
    const url = `${baseURL}/merchant-information/remove?id=${payload.id}`
    return this.gateway.delete({ url })
  }

  /**
   * 获取商户信息详情
   */
  public async getMerchantInfoDetail (payload: {
    id: string;
  }): Promise<MerchantInfoVo> {
    const url = `${baseURL}/merchant-information/detail`
    return this.gateway.get<MerchantInfoVo>({ url, payload })
  }

  /**
   * 获取区域树
   */
  public async getRegionTree (payload: {
    deep: number;
  }): Promise<RegionTreeVo[]> {
    const url = `${baseURL}/country-address/tree`
    return this.gateway.get<RegionTreeVo[]>({ url, payload })
  }

  /**
   * 编辑商户信息
   */
  public async editMerchantInfo (payload: {
    id: string;
    name: string;
    sex: string;
    age: number | string;
    merchantType: string;
    area?: string;
    businessScope: string;
    vehicleType?: string;
    nativePlaceIds?: string;
    upstreamSourceIds?: string;
    businessScaleNumber?: string;
  }): Promise<unknown> {
    const url = `${baseURL}/merchant-information/edit`
    return this.gateway.update<unknown>({ url, payload })
  }

  /**
   * 下载模板
   */
  public async downloadTemplate (payload: {
    merchantType: string;
  }): Promise<Blob> {
    let url = `${baseURL}/merchant-information/template`
    if (payload.merchantType === 'PURCHASER') {
      url += '/download-purchaser'
    } else {
      url += '/download-wholesaler'
    }
    const resp = await this.gateway.customBlob({
      url,
      method: 'GET',
      query: payload
    })
    return resp
  }

  /**
   * 导入模板
   */
  public async importTemplate (payload: {
    file: Blob;
    merchantType: string;
    replaceBool: boolean;
  }): Promise<ImportResultVO> {
    let url = `${baseURL}/merchant-information/template/import-`
    if (payload.merchantType === 'PURCHASER') {
      url += 'purchaser'
    } else {
      url += 'wholesaler'
    }
    const form = new FormData()
    form.append('file', payload.file)
    form.append('replaceBool', payload.replaceBool)
    const resp = await this.gateway.custom<ImportResultVO>({
      url,
      payload: form,
      method: 'POST'
    })
    return resp
  }

  /**
   * 导出失败清单
   */
  public async exportFailList (payload: {
    dataList: unknown[];
    merchantType: string;
  }): Promise<Blob> {
    let url = `${baseURL}/merchant-information/download`
    if (payload.merchantType === 'PURCHASER') {
      url += '/purchaser-error'
    } else {
      url += '/wholesaler-error'
    }
    const resp = await this.gateway.customBlob({
      url,
      method: 'POST',
      payload
    })
    return resp
  }

  /**
   * 获取商户统计数据
   */
  public async getMerchantStatistics (): Promise<MerchantData> {
    const url = `${baseURL}/merchant-information/stat`
    return this.gateway.get<MerchantData>({ url })
  }

  /**
   * 昨日来货统计
   */
  public async getGoodsYesterday (deliveryDate: string): Promise<MerchantData> {
    const url = `${baseURL}/get/goods/yesterday`
    return this.gateway.get<MerchantData>({ url, payload: { deliveryDate } })
  }

  /**
   * 近一周来货趋势图
   */
  public async getGoodsWeek (payload: {
    begin: string;
    end: string;
  }): Promise<MerchantData> {
    const url = `${baseURL}/get/goods/week`
    return this.gateway.get<MerchantData>({ url, payload })
  }
}
