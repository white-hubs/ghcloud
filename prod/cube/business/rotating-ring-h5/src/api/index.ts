import { cubeDeviceCenterInternalService, cubeDeviceCenterService } from './api/service'

/**
 * 获取设备基本信息统计
 * @param id 设备ID
 * @returns Promise<RequestReturnType<BasicState>>
 */
export const getDeviceinfo = async (id: string): Promise<any> => {
  const res = await cubeDeviceCenterInternalService.getDeviceInfo(id)
  return res
}
export const getHistory = async (params: {
  deviceId: string;
  propCodes: string;
  startTs: number;
  endTs: number;
}): Promise<unknown> => {
  const res = await cubeDeviceCenterService.getHistory(params)
  return res
}
export const getDeviceAttribute = async (params: {
  deviceId: string;
  withPropertySpec: boolean;
}): Promise<unknown> => {
  const res = await cubeDeviceCenterService.getNorthDeviceDetail(params)
  return res
}

type DeviceType = {
  [keyof in string | any]: {
    tags: {
      tagCode: string;
    }[] ;
  }
}
export const getDeviceType = async (id: string[]): Promise<DeviceType> => {
  return cubeDeviceCenterService.getDeviceTagCode(id) as unknown as DeviceType
}
