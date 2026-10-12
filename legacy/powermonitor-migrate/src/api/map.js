import request from '@/utils/request'
const baseURL = '/api/securitymanagement'
/**
 * 获取地图设备点位
*/
export const getAreaDevicePoint = (applicationCode, method = 'get') =>
  request({
    url: baseURL + `/area-point/${applicationCode}`,
    method: method,
  })
/**
 * 获取设备能查看的属性
*/
export const getDevicesAttr = (params, method = 'get') =>
  request({
    url: baseURL + `/group-attributive/${params.applicationCode}`,
    method: method,
    params
  })
/**
* 获取设备属性值
*/
export const getDevicesAttrValue = (params, method = 'get') =>
  request({
    url: `/api/iot/north/device/detail`,
    method: method,
    params
  })
// export const getDevicesAttrValue = (id, method = 'get') =>
//   request({
//     url: baseURL + `/device/instance/${id}/running/attr`,
//     method: method,
//   })
/**
* 获取设备历史数据
*/
export const getDevicesHistory = (data, method = 'post') =>
  request({
    url: baseURL + `/historical-attribute`,
    method: method,
    data
  })
export const tenantinfo = (code, method = "get") =>
  request({
    url: `/api/ouaa/tenant-under-tenant/${code}`,
    method: method,

  });