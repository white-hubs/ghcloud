import request from "@/utils/request.js"
import { cubeDeviceCenterService } from './service'
const baseURL = '/api/device'

// 分类下的设备实例
export const generDevice = (params, method = 'get') =>
  request({
    url: baseURL + '/device/instance/list-by-genre',
    method: method,
    params
  })

  export const getDeviceProduct = (params, method = 'get') =>
  cubeDeviceCenterService.getIotProductCategoryTree()
  
  export const getDeviceList = params =>
  cubeDeviceCenterService.getDeviceInstancePageAll(params)