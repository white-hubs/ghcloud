import { getApiBaseUrL, getAuthHeaders } from '@ghcloud/cube-app-js-sdk'
import { HTTPClientImpl } from '../../infrastructure/http-client'
import { BaseAPIResult } from '../base-api'

interface List{
  total: number;
  records: {id:string, name:string}[];
}
interface Device{
  total: number;
  records: {deviceId:string,deviceName:string,areaName:string}[];
}

class DeviceService {
  private readonly client = new HTTPClientImpl({
    baseURL: getApiBaseUrL()??'/api',
    headers: getAuthHeaders()
  })

  /**
   *
   * @returns 设备列表 物联1.0
   */
  public async getDeviceList (params: { pageSize: number; pageNumbe?: number; businessType?: string; receiveDepId?: string; keyword?: string; }): Promise<List> {
    const result = await this.client.get<List>('/device/device/instance/list-page', { query: params })
    return result
  }

  /** 设备运行信息 物联1.3 */
  public async deviceRunInfo (params: { deviceInstanceId?: string;}): Promise<List> {
    const result = await this.client.get<List>(`/device/device/instance/${params.deviceInstanceId}/running/status`, { query: params })
    return result
  }
  public async outsourceDevice(params: any): Promise<Device> {
    const result = await this.client.get<Device>(`/maintain/outsource/device/list`,  {
    pageSize:1000,
    pageNumber:1,
    ...params
    
    })
    return result
  }
}

export const deviceService = new DeviceService()
