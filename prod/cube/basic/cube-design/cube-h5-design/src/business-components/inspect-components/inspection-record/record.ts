import { Inspection } from '../inspection'
import type { InspectionParams } from './type'

export class InspectionRecord<T > extends Inspection<T> {
  public getListApi: ((params?: InspectionParams) => Promise<unknown>) | undefined
  public objList: unknown[] = []
  public constructor (options: {
    searchParams: Record<string, unknown>;
    getListApi?: (params?: InspectionParams) => Promise<unknown>;
  }) {
    super(options.searchParams)
    this.getListApi = options.getListApi
  }

  // 列表数据
  public async getListData (): Promise<unknown > {
    if (!this.getListApi) {
      throw new Error('未配置API请求方法')
    }
    return this.getListApi(this.searchParams)
  }

  // 详情数据
  public async getDetailData<R = unknown> (requestApi: (payload: R) => Promise<Record<string, unknown>>, payload: R): Promise<unknown> {
    return this.loadDetailData(requestApi, payload)
  }

  // 提交
  public async submitData<R = unknown> (requestApi: (payload: R) => Promise<unknown>, payload: R, message?: string): Promise<unknown> {
    return this.handleSubmit(requestApi, payload, message)
  }
}
