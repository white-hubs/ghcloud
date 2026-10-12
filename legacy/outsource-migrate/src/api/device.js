import request from '@ghcloud-legacy/bimops-fe-web-migrate-lib/lib/utils/request'
import { cubeDeviceCenterService } from './service'

const baseURL = '/api/device'
export const processInputForm = (params, method = 'get') =>
  request({
    url: `/api/process/form/task/${params.id ? params.id : params
      }`,
    method: method,
    params,
  })
  export const processComplete = (data, method = 'get') =>
  request({
    url: `/api/process/user-tasks/complete`,
    method: method,
    data,
  })
  export const processList = (params, method) =>
  request({
    url: `/api/process/process-definition/list`,
    method: method,
    params,
  })
// 分类下的设备实例
export const generDevice = (params, method = 'get') =>
  request({
    url: baseURL + '/device/instance/list-by-genre',
    method: method,
    params
  })
export const getDeviceProduct = (params, method = 'get') =>
cubeDeviceCenterService.getIotProductCategoryTree()

export const getDevices = params =>
cubeDeviceCenterService.getDeviceInstancePageAll(params)