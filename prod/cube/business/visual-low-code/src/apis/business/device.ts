import { request } from '@/service/index'
import type { DeviceInfoType, IotConfigType, CameraType } from './device.i.ts'
const baseUrl = '/device/'
/**
 * 获取设备类型
 */
export const getDeviceGenreList = async (): Promise<Service.RequestResult> => {
  return request.get(baseUrl + 'device/genre/search')
}
/**
 * 设备属性写值
 */
// export function attributeWriteValue<T extends Record<string,any>>(data:T){
//   return request<any>({
//       url:`${baseURL}/device/instance/running/attr/control`,
//       method:"POST",
//       data
//   })
// }
type CurValueType = boolean | string | number | null
export const attributeWriteValue = async (params: {
  deviceInstanceId: string | number;
  keyValues: {
    attributeCode: string;
    originalValue: {
      name: string;
      value: CurValueType | undefined;
    };
    expectedValue: {
      name: string;
      value: string;
    };
  }[]; }): Promise<Service.RequestResult> => {
  return request.post(baseUrl + 'device/instance/running/attr/control', { params })
}
/**
 * 设备查询
 */
export const getDevicePage = async (params: {
  genreId: string; keyword?: null | string;
  pageNumber?: number;
  pageSize?: number; }): Promise<Service.RequestResult> => {
  return request.get(baseUrl + 'device/instance/list-page', { params })
}
/**
 * @说明 设备信息
 * @returns
 */
export const getDeviceInfo = async (id: number | string): Promise<Service.RequestResult<DeviceInfoType>> => {
  return request.get(`/securitymanagement/getDeviceInfo/${id}`)
}

/**
 * @说明 获取单设备的关联的监控设备
 * @returns
 */
export const associatedVideos = async (id: string): Promise<Service.RequestResult<CameraType[]>> => {
  return request.get(`${baseUrl}device/instance/${id}/associated/videos`)
}

export const getiotconfig = async (id: string): Promise<Service.RequestResult<IotConfigType>> => {
  return request.get(`${baseUrl}device/instance/iot-config/${id}`)
}

export const subscribeDeviceAttribute = async (params: {
  subscribeId: string; subscribedDevices: object | null; }): Promise<Service.RequestResult> => {
  return request.get(baseUrl + 'device/instance/running/attr/newSubscribe', { params })
}
