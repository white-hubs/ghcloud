import { CubeAppBusinessBridge } from './business/business'
import request, { type RequestReturnType } from './js/cube-app-h5-request'
import { cubeAppServiceInstance, CubeAppService } from './js/cube-app.service'
import { initAuthHeadersByCubeAppBridge, getAuthHeaders, getApiBaseUrL, setCustomHeaders } from './js/cube-h5-config'
import { cubeWxServiceInstance, CubeWxService } from './wx/cube-wx-service'

export {
  request,
  type RequestReturnType,
  initAuthHeadersByCubeAppBridge,
  getAuthHeaders,
  getApiBaseUrL,
  setCustomHeaders,
  CubeAppService,
  cubeAppServiceInstance as cubeAppService, // 桥接能力都在这里面
  CubeWxService,
  cubeWxServiceInstance as cubeWxService,
  CubeAppBusinessBridge
}
