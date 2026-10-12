import { request } from '@/service/index'

export const getdevicelist = async (): Promise<Service.RequestResult> => {
  return request.get('/meter-device/list')
}
export const getwatersupply = async (params: {
  period: string;
  timeFlag: string;
  deviceId: string;
}): Promise<Service.RequestResult> => {
  return request.get('/water-supply', {
    params
  })
}
export const getbackwater = async (params: {
  period: string;
  timeFlag: string;
  deviceId: string;
}): Promise<Service.RequestResult> => {
  return request.get('/backwater', {
    params
  })
}
export const getvelocityflow = async (params: {
  period: string;
  timeFlag: string;
  deviceId: string;
}): Promise<Service.RequestResult> => {
  return request.get('/velocity-flow', {
    params
  })
}
