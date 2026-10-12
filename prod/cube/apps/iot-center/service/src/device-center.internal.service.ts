import { type CubeAuth, CubeGateway, type LegacyServiceError } from '@ghcloud/cube-gateway'
import { BASE_API } from '@ghcloud/cube-protocol'
import type { CustomerTagVO, DeviceTagDetail, DeviceCenterInternalDetailVO, DeviceDataShare } from './types'

const baseURL = `${BASE_API}`

/** 物联中心内部调用接口类 */
export class CubeDeviceCenterInternalService {
  private readonly gateway: CubeGateway

  public constructor (auth: CubeAuth) {
    this.gateway = new CubeGateway(auth)
  }

  // 设备关联数据
  public async getDeviceDataShare (deviceId: string): Promise<DeviceDataShare[]> {
    const url = `${baseURL}/device-center/device/mgt/data-share/${deviceId}/as-source`
    const resp = await this.gateway.get<DeviceDataShare[]>({ url })
    return resp
  }

  // 关联设备属性数据-目标设备
  public async getDeviceDataShareTarget (deviceId: string): Promise<DeviceDataShare[]> {
    const url = `${baseURL}/device-center/device/mgt/data-share/${deviceId}/as-target`
    const resp = await this.gateway.get<DeviceDataShare[]>({ url })
    return resp
  }

  // 设备属性关联-新增
  public async addDeviceDataShare (payload: {
    sourceDeviceId: string;
    sourceDataType: string;
    sourceDataId: string;
    targetDeviceId: string;
    targetDataId: string;
    shareMode: string;
  }): Promise<unknown> {
    const url = `${baseURL}/device-center/device/mgt/data-share`
    const resp = await this.gateway.create<unknown>({ url, payload })
    return resp
  }

  // 设备属性关联-批量新增
  public async batchAddDeviceDataShare (payload: {
    sourceDeviceId: string;
    sourceDataType: string;
    sourceDataId: string;
    targetDeviceId: string;
    targetDataId: string;
    shareMode: string;
  }[]): Promise<unknown> {
    const url = `${baseURL}/device-center/device/mgt/data-share/batch`
    const resp = await this.gateway.create<unknown>({ url, payload })
    return resp
  }

  // 设备属性关联-移除
  public async removeDeviceDataShare (id: string): Promise<unknown> {
    const url = `${baseURL}/device-center/device/mgt/data-share/${id}`
    const resp = await this.gateway.delete({ url })
    return resp
  }

  // 设备属性关联-批量移除
  public async batchRemoveDeviceDataShare (payload: {
    ids: string[];
  }): Promise<unknown> {
    const url = `${baseURL}/device-center/device/mgt/data-share/batch/del`
    const resp = await this.gateway.create<unknown>({ url, payload })
    return resp
  }


  public async getDeviceInfo (id: string): Promise<unknown> {
    const url = `${baseURL}/device-center/device/${id}?deviceId=${id}`
    const resp = await this.gateway.get<LegacyServiceError<unknown>>({ url })
    return resp.data || resp
  }

  /** 设备列表 分页 */
  public async getDevicePage (payload: {
    pageSize?: number;
    pageNumber?: number;
    prodId?: string | undefined;
    deviceNameOrNumber?: string | undefined;
    isMainDeviceOnly?: boolean | undefined;
    deviceIds?: string | undefined;
  }): Promise<{ records: unknown[]; total: number; }> {
    const url = `${baseURL}/device-center/device/mgt/page`
    const resp = await this.gateway.get<LegacyServiceError<{ records: unknown[]; total: number; }>>({ url, payload })
    return resp.data || resp
  }
  /** 设备列表 */
  public async getDeviceList (payload: {
    prodId?: string | undefined;
    prodCategoryId?: string | undefined;
    deviceNameOrNumber?: string | undefined;
    status?: string | number | undefined;
    isMainDeviceOnly?: boolean | undefined;
    deviceIds?: string | undefined;
  }): Promise<unknown[]> {
    const url = `${baseURL}/device-center/device/mgt/list`
    const resp = await this.gateway.get<LegacyServiceError<unknown[]>>({ url, payload })
    return resp.data || resp
  }

  /** 设备-查询所有可用网关 */
  public async getDeviceGateway (): Promise<unknown[]> {
    const url = `${baseURL}/device-center/device/mgt/visible/gateway`
    const resp = await this.gateway.get<LegacyServiceError<unknown[]>>({ url })
    return resp.data || resp
  }

  /** 设备详情 */
  public async getDeviceDetail (payload: {
    deviceId: string;
  }): Promise<DeviceCenterInternalDetailVO> {
    const url = `${baseURL}/device-center/device/mgt/${payload.deviceId}`
    const resp = await this.gateway.get <LegacyServiceError<DeviceCenterInternalDetailVO>>({ url, payload })
    return resp.data || resp
  }

  /** 设备列表-删除 */
  public async delDevice (payload: { ids: string[]; }): Promise<void> {
    const url = `${baseURL}/device-center/device/mgt/batch/del`
    await this.gateway.custom<LegacyServiceError<unknown>>({ method: 'POST', url, payload })
  }

  /** 设备列表-新增 */
  public async addDevice (payload: {
    productId: string | undefined;
    parentDeviceId: string | null;
    deviceNumber: string;
    deviceName: string;
    deviceType: number;
    remark?: string;
    nodeType: number | undefined;
    nodeTypeName: string | undefined;
    relationDeviceIds?: string | undefined;
  }): Promise<unknown> {
    const url = `${baseURL}/device-center/device/mgt`
    const resp = await this.gateway.create<LegacyServiceError<unknown>>({ url, payload })
    return resp.data || resp
  }

  public async updateDevice (payload: {
    deviceId: string;
    config?: string | undefined;
    rawDeviceId?: string | undefined;
    deviceNumber?: string | undefined;
    name?: string | undefined;
    relationDeviceIds?: string | undefined;
  }): Promise<void> {
    const url = `${baseURL}/device-center/device/mgt/update-device`
    await this.gateway.update({ url, payload })
  }

  /** 设备批量导入 */
  public async importBatchDevice (payload: {
    productId: string | undefined;
    parentDeviceId?: string | null;
    isSubDevice: number;
    excel: Blob | null;
  }): Promise<unknown> {
    const url = `${baseURL}/device-center/device/mgt/batch/import-excel-batch-new`
    const form = new FormData()
    form.append('excel', payload.excel)
    if (payload.parentDeviceId)form.append('parentDeviceId', payload.parentDeviceId)
    form.append('isSubDevice', payload.isSubDevice)
    form.append('productId', payload.productId)
    const resp = await this.gateway.custom<LegacyServiceError<unknown>>({
      url,
      payload: form,
      method: 'POST'
    })
    return resp.data || resp
  }

  /** 设备导出模版 */
  public async exportDeviceTemplate (): Promise<Blob> {
    const url = `${baseURL}/device-center/device/mgt/batch/export-excel-template`
    const resp = await this.gateway.customBlob({
      url,
      method: 'GET'
    })
    return resp
  }

  /** 设备台账导入 */
  public async importBatchDeviceInstance (payload: {
    file: Blob | null;
  }): Promise<unknown> {
    const url = `${baseURL}/device-center/mgt/batch/import-form-template`
    const form = new FormData()
    form.append('file', payload.file)
    const resp = await this.gateway.custom<LegacyServiceError<unknown>>({
      url,
      payload: form,
      method: 'POST'
    })
    return resp.data || resp
  }

  /** 设备台账导出模版 */
  public async exportDeviceInstanceTemplate (payload: {
    productId: string | null;
  }): Promise<Blob> {
    const url = `${baseURL}/device-center/mgt/batch/export-template`
    return this.gateway.customBlob({ method: 'GET', url, payload })
  }

  /** 设备-实时属性最新值 **/
  public async getDevicePropRelVal (payload: {
    deviceId: string;
  }): Promise<{ propValList: unknown[]; }> {
    const url = `${baseURL}/device-center/device/mgt/devRelVal/${payload.deviceId}`
    const resp = await this.gateway.get<LegacyServiceError<{ propValList: unknown[]; }>>({ url, payload })
    return resp.data || resp
  }

  /** 设备-历史属性 **/
  public async getDeviceHistoryProp (payload: {
    deviceId: string;
    prodCategoryId?: string;
    propCodes?: string[];
    pageNumber: number;
    pageSize: number;
    startTime?: string;
    endTime?: string;
  }): Promise<{ records: unknown[]; total: number; }> {
    const url = `${baseURL}/device-center/device/mgt/history/page/prop`
    const resp = await this.gateway.get<LegacyServiceError<{ records: unknown[]; total: number; }>>({ url, payload })
    return resp.data || resp
  }

  /** 设备-历史事件 **/
  public async getDeviceHistoryEvent (payload: {
    deviceId: string;
    prodCategoryId?: string;
    propCodes?: string[];
    eventCodes?: string[];
    pageNumber: number;
    pageSize: number;
    startTime?: string;
    endTime?: string;
  }): Promise<{ records: unknown[]; total: number; }> {
    const url = `${baseURL}/device-center/device/mgt/history/page/event`
    const resp = await this.gateway.get<LegacyServiceError<{ records: unknown[]; total: number; }>>({ url, payload })
    return resp.data || resp
  }

  /** 获取预置标签列表 */
  public async getTagBuiltins (): Promise< { tagCode: string;tagName: string; }[] > {
    const url = `${baseURL}/device-center/tag/builtins`
    const resp = await this.gateway.get<LegacyServiceError<{ tagCode: string;tagName: string; }[]>>({ url })
    return resp.data || resp
  }

  /** 标签绑定 */
  public async bindTagBuiltins (payload: { tagCode: string; businessKeys: string[]; }): Promise< unknown > {
    const url = `${baseURL}/device-center/tag/bind`
    const resp = await this.gateway.create<LegacyServiceError<unknown>>({ url, payload })
    return resp.data || resp
  }

  /** 获取产品下挂载的设备标签列表 */
  public async getProductDeviceTags (productId: string): Promise< { id: string;tagCode: string;tagName: string; }[] > {
    const url = `${baseURL}/device-center/iot/product/${productId}/device-tags`
    const resp = await this.gateway.get<LegacyServiceError<{ id: string; tagCode: string;tagName: string; }[]>>({ url })
    return resp.data || resp
  }

  /** 标签解绑 */
  public async unbindTagBuiltins (payload: { tagCode: string; businessKeys: string[]; }): Promise< unknown > {
    const url = `${baseURL}/device-center/tag/unbind`
    const resp = await this.gateway.update<LegacyServiceError<unknown>>({ url, payload })
    return resp.data || resp
  }

  /** 自定义标签-新建/编辑 */
  public async addCustomerTag (payload: {
    description?: null | string;
    id?: string | null;
    tagName?: null | string;
  }): Promise<unknown> {
    const url = `${baseURL}/device-center/customer/tag`
    return this.gateway.create<LegacyServiceError<unknown>>({ url, payload })
  }

  /** 自定义标签-删除 */
  public async delCustomerTag (id: string): Promise<void> {
    const url = `${baseURL}/device-center/customer/tag/delete/${id}`
    await this.gateway.delete({ url })
  }

  /** 标签 启用状态修改 */
  public async updateTagStatus (status: string, tagId: string): Promise<void> {
    const url = `${baseURL}/device-center/customer/${tagId}/enable/${status}`
    await this.gateway.update({ url })
  }

  /** 标签 分页 */
  public async getTagPageByType (type: 'SYSTEM' | 'CUSTOMER', payload: {
    deviceId?: number | undefined;
    pageNumber?: number | undefined;
    pageSize?: number | undefined;
    period?: string | { begin?: string;end?: string; } | undefined;
    tagName?: string | undefined;
    status?: string | number | undefined;
  }): Promise<{ records: CustomerTagVO[]; total: number; }> {
    const url = `${baseURL}/device-center/tag/${type}/page`
    const resp = await this.gateway.get<LegacyServiceError<{ records: CustomerTagVO[]; total: number; }>>({ url, payload })
    return resp.data || resp
  }

  /** 查询设备标签详情列表 自定义标签 */
  public async getDeviceTagDetails (deviceId: string): Promise<DeviceTagDetail[]> {
    const url = `${baseURL}/device-center/customer/tag/${deviceId}/list`
    const resp = await this.gateway.get<LegacyServiceError<DeviceTagDetail[]>>({ url })
    return resp.data || resp
  }

  /** 查询设备所有标签 */
  public async getDeviceAllTag (payload: string[]): Promise<Record<string, DeviceTagDetail[]>> {
    const url = `${baseURL}/device-center/device/all-tags`
    const resp = await this.gateway.custom<LegacyServiceError<Record<string, DeviceTagDetail[]>>>({ method: 'POST', url, payload })
    return resp.data || resp
  }

  /** 批量设备绑定自定义标签 */
  public async batchDeviceBindCustomerTags (payload: {
    deviceIds?: string[] | null;
    tagIds?: string[] | null;
  }): Promise<unknown> {
    const url = `${baseURL}/device-center/customer/tag/batch/bind`
    const resp = await this.gateway.custom<LegacyServiceError<unknown>>({ url, payload, method: 'POST' })
    return resp.data || resp
  }

  /** 设备绑定自定义标签 */
  public async deviceBindCustomerTags (payload: {
    deviceId?: string | null;
    tagIds?: string[] | null;
  }): Promise<unknown> {
    const url = `${baseURL}/device-center/customer/tag/bind`
    const resp = await this.gateway.custom<LegacyServiceError<unknown>>({ url, payload, method: 'POST' })
    return resp.data || resp
  }

  /** 设备绑定内置标签 */
  public async deviceBindSystemTags (payload: {
    deviceId?: string | null;
    tagIds?: string[] | null;
  }): Promise<unknown> {
    const url = `${baseURL}/device-center/device/tag/bind`
    const resp = await this.gateway.custom<LegacyServiceError<unknown>>({ url, payload, method: 'POST' })
    return resp.data || resp
  }
}
