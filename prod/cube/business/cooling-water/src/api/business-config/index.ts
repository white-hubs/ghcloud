import { request } from '@/service/index'
const baseUrl = '/securitymanagement'
/**
 * 获取商户
 * @param data 商户数据
 * @returns Promise
 */
export const getWholesalers = async (): Promise<Service.RequestResult> => {
  return request.get(`${baseUrl}/add-wholesalers`)
}
interface PageParams {
  keyword: string;
  pageNumber: number;
  pageSize: number;
}
/**
 * 获取商户配置列表
 * @param params 分页查询参数
 * @returns 列表数据
 */
export const getWholesalersConfigList = async (params: PageParams): Promise<Service.RequestResult> => {
  return request.get(`${baseUrl}/wholesalers`, { params })
}
/**
 * 获取设备配置列表
 * @param params 分页查询参数
 * @returns 列表数据
 */
export const getDeviceConfigList = async (params: PageParams): Promise<Service.RequestResult> => {
  return request.get(`${baseUrl}/device-position`, { params })
}
/**
 * 获取档位数据
 * @returns
 */
export const getGearOptions = async (): Promise<Service.RequestResult> => {
  return request.get('/stall/gen-stall/list')
}
/**
 * 根据区域获取档位
 * @returns
 */
export const getGearOptionsByArea = async (params: { area: string; }): Promise<Service.RequestResult> => {
  return request.get('/stall/stall-by-area', { params })
}
interface RelateState {
  wholesalerId: string[];
  timePositionParams: {
    gearPositionId: string;
    billableTime: string;
  }[];
}
/**
 * 商户关联档位
 * @param data 关联档位数据
 * @returns
 */
export const relateGear = async (data: RelateState): Promise<Service.RequestResult> => {
  return request.post(`${baseUrl}/association`, data)
}
/**
 * 商户取消关联档位
 * @param id 取消关联的数据id
 * @returns
 */
export const cancelRelateGear = async (id: string): Promise<Service.RequestResult> => {
  return request.get(`${baseUrl}/association-cancellation/${id}`)
}
interface DeviceRelateState {
  coldWaterDevice: string;
  unitPrice: string;
  emplaceTemperature: string;
  unitTraffic: string;
  gearPositionId: string;
}
/**
 * 设备关联档位
 * @param data 关联档位数据
 * @returns
 */
export const deviceRelateGear = async (data: DeviceRelateState[]): Promise<Service.RequestResult> => {
  return request.post(`${baseUrl}/device-position-association`, data)
}
/**
 * 取消关联档位
 * @param params 参数 设备id 档位id
 * @returns
 */
export const cancelDeviceRelate = async (params: { gearPositionId: string;deviceId: string; }): Promise<Service.RequestResult> => {
  return request.get(`${baseUrl}/cancellation-device`, { params })
}
/**
 * 获取被关联的档位
 * @returns
 */
export const getRelatedGears = async (): Promise<Service.RequestResult> => {
  return request.get(`${baseUrl}/cold-gear-position-id`)
}
