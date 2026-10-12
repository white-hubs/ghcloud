// import { type CubeAuth, CubeGateway, type LegacyServiceError } from '@ghcloud/cube-gateway'
// import { BASE_API } from '@ghcloud/cube-protocol'

// const baseURL = `${BASE_API}`

// /** 物联中心内部调用接口类 */
// export class CubeDeviceCenterInternalService {
//   private readonly gateway: CubeGateway

//   public constructor (auth: CubeAuth) {
//     this.gateway = new CubeGateway(auth)
//   }

//   /** 设备列表 分页 */
//   public async getDevicePage (payload: {
//     pageSize: number;
//     pageNumber: number;
//     prodId?: string | undefined;
//     deviceNameOrNumber?: string | undefined;
//   }): Promise<{ records: unknown[]; total: number; }> {
//     const url = `${baseURL}/device-center/device/mgt/page`
//     const resp = await this.gateway.get<LegacyServiceError<{ records: unknown[]; total: number; }>>({ url, payload })
//     return resp.data
//   }

//   /** 设备-查询所有可用网关 */
//   public async getDeviceGateway (): Promise<unknown[]> {
//     const url = `${baseURL}/device-center/device/mgt/visible/gateway`
//     const resp = await this.gateway.get<LegacyServiceError<unknown[]>>({ url })
//     return resp.data
//   }

//   /** 设备详情 */
//   public async getDeviceDetail (payload: {
//     deviceId: string;
//   }): Promise<unknown> {
//     const url = `${baseURL}/device-center/device/mgt/${payload.deviceId}`
//     const resp = await this.gateway.get < LegacyServiceError<unknown>>({ url, payload })
//     return resp.data
//   }

//   /** 设备列表-删除 */
//   public async delDevice (payload: { ids: string[]; }): Promise<void> {
//     const url = `${baseURL}/device-center/device/mgt/batch/del`
//     await this.gateway.custom<LegacyServiceError<unknown>>({ method: 'POST', url, payload })
//   }

//   /** 设备列表-新增 */
//   public async addDevice (payload: {
//     productId: string;
//     parentDeviceId: string | null;
//     deviceNumber: string;
//     deviceName: string;
//     deviceType: number;
//     remark?: string;
//     nodeType: number | undefined;
//     nodeTypeName: string | undefined;
//   }): Promise<unknown> {
//     const url = `${baseURL}/device-center/device/mgt`
//     const resp = await this.gateway.create<LegacyServiceError<unknown>>({ url, payload })
//     return resp.data
//   }
//   public async updateDevice (payload: {
//     deviceId: string;
//     config?: string | undefined;
//     rawDeviceId?: string | undefined;
//   }): Promise<void> {
//     const url = `${baseURL}/device-center/device/mgt/update-device`
//     await this.gateway.update({ url, payload })
//   }

//   /** 设备批量导入 */
//   public async importBatchDevice (payload: {
//     productId: string;
//     parentDeviceId?: string | null;
//     isSubDevice: number;
//     excel: Blob | null;
//   }): Promise<unknown> {
//     const url = `${baseURL}/device-center/device/mgt/batch/import-excel-batch-new`
//     const form = new FormData()
//     form.append('excel', payload.excel)
//     if (payload.parentDeviceId)form.append('parentDeviceId', payload.parentDeviceId)
//     form.append('isSubDevice', payload.isSubDevice)
//     form.append('productId', payload.productId)
//     const resp = await this.gateway.custom<LegacyServiceError<unknown>>({
//       url,
//       payload: form,
//       method: 'POST'
//     })
//     return resp.data
//   }

//   /** 设备导出模版 */
//   public async exportDeviceTemplate (): Promise<Blob> {
//     const url = `${baseURL}/device-center/device/mgt/batch/export-excel-template`
//     const resp = await this.gateway.customBlob({
//       url,
//       method: 'GET'
//     })
//     return resp
//   }

//   /** 设备台账导入 */
//   public async importBatchDeviceInstance (payload: {
//     file: Blob | null;
//   }): Promise<unknown> {
//     const url = `${baseURL}/device-center/mgt/batch/import-form-template`
//     const form = new FormData()
//     form.append('file', payload.file)
//     const resp = await this.gateway.custom<LegacyServiceError<unknown>>({
//       url,
//       payload: form,
//       method: 'POST'
//     })
//     return resp.data
//   }

//   /** 设备台账导出模版 */
//   public async exportDeviceInstanceTemplate (payload: {
//     productId: string;
//   }): Promise<Blob> {
//     const url = `${baseURL}/device-center/mgt/batch/export-template?productId=${payload.productId}`
//     return this.gateway.customBlob({ method: 'GET', url, payload })
//   }

//   /** 设备-实时属性最新值 **/
//   public async getDevicePropRelVal (payload: {
//     deviceId: string;
//   }): Promise<{ propValList: unknown[]; }> {
//     const url = `${baseURL}/device-center/device/mgt/devRelVal/${payload.deviceId}`
//     const resp = await this.gateway.get<LegacyServiceError<{ propValList: unknown[]; }>>({ url, payload })
//     return resp.data
//   }

//   /** 设备-历史属性 **/
//   public async getDeviceHistoryProp (payload: {
//     deviceId: string;
//     prodCategoryId?: string;
//     propCodes?: string[];
//     pageNumber: number;
//     pageSize: number;
//   }): Promise<{ records: unknown[]; total: number; }> {
//     const url = `${baseURL}/device-center/device/mgt/history/page/prop`
//     const resp = await this.gateway.get<LegacyServiceError<{ records: unknown[]; total: number; }>>({ url, payload })
//     return resp.data
//   }

//   /** 设备-历史事件 **/
//   public async getDeviceHistoryEvent (payload: {
//     deviceId: string;
//     prodCategoryId?: string;
//     propCodes?: string[];
//     eventCodes?: string[];
//     pageNumber: number;
//     pageSize: number;
//   }): Promise<{ records: unknown[]; total: number; }> {
//     const url = `${baseURL}/device-center/device/mgt/history/page/event`
//     const resp = await this.gateway.get<LegacyServiceError<{ records: unknown[]; total: number; }>>({ url, payload })
//     return resp.data
//   }
// }
