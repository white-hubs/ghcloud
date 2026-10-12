import { getAuthRequester, getPublicRequester } from '../request'
import type { ApplicationDevice, DeviceInstance, DeviceModel, DeviceProductPropVoList, DeviceType, PageResult } from './device.model'

export class DeviceService {
  private static readonly publicRequester = getPublicRequester()

  private static readonly authRequester = getAuthRequester()

  public static async getDeviceType (): Promise<DeviceType[]> {
    const url = '/api/device-center/device/genre/list'
    return this.authRequester.get({
      url,
    })
  }

  public static async getDeviceModel (genreId: string): Promise<DeviceModel[]> {
    const url = `/api/device-center/device/${genreId}/product/list`
    return this.authRequester.get({
      payload: {
        genreId,
      },
      url,
    })
  }

  public static async getArea (): Promise<{
    name: string;
    id: string;
  }[]> {
    const url = '/api/mdata/area/list'
    return this.authRequester.get({

      url,
    })
  }

  public static async getDeviceInstance (params: {
    bizType: string;
    areaId: string;
    keyword: string;
    pageNumber: number;
    pageSize: number;
  }): Promise<PageResult<DeviceInstance>> {
    const url = '/api/device-center/device-instance/page'
    return this.authRequester.get({
      payload: {
        ...params,
      },
      url,
    })
  }

  public static async getDeviceArea (): Promise<{ name: string;id: string; }[]> {
    const url = '/api/mdata/area/list'
    return this.authRequester.get({

      url,
    })
  }

  public static async getApplicationDevice (params: {
    pageNumber: number;
    pageSize: number;
    applicationCode: string;
    areaId: string;
    keyword: string;
    productId?: string;
  }): Promise<PageResult<ApplicationDevice>> {
    const url = `/api/securitymanagement/getSecurityDevicePage/${params.applicationCode}`
    return this.authRequester.get({
      payload: {
        ...params
      },
      url,
    })
  }

  // 获取能碳的设备列表
  public static async getEnergyApplicationDevice (params: {
    instrumentType?: string | undefined;
    deviceAreaId?: string | undefined;
    keyword: string;
    total?: number;
    pageSize: number;
    pageNumber: number; }): Promise<PageResult<ApplicationDevice>> {
    const url = '/api/energymanagement/meter-device/page'
    return this.authRequester.get({
      payload: {
        ...params
      },
      url,
    })
  }

  public static async getDeviceCondition (params: {
    prodIds: string | null;
    withPropertySpec: boolean;
  }): Promise<DeviceProductPropVoList[]> {
    const url = '/api/iot/north/product/prod-list-detail'
    return this.authRequester.get({
      payload: {
        ...params,
      },
      url,
    })
  }
}
