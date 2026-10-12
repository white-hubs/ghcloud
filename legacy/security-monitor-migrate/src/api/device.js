import request from '@/utils/request'
let baseURL = '/api/device'
let baseURL1 = "/api/device-center";
let baseURL2 = "/api/iot";

// 设备实列列表
// export const getIotDeviceList = (params) =>
//   request({
//     url:baseURL+'/device/instance/list-page',
//     method:'get',
//     params
//   })
export const getInstanceList = (params, method = "get") =>
  request({
    url: baseURL1 + "/device-instance/page",
    method: method,
    params,
  });
// 型号下的事件定义列表
// export const deviceModelEventList = (params) =>
//   request({
//     url: baseURL + `/device/model/${params.modelId}/event/code/list`,
//     method: "get",
//     params
//   })
export const deviceModelEventList = (params) =>
  request({
    url: baseURL2 + `/north/product/prod-list-detail`,
    method: "get",
    params
  })
// 获取设备类型
// export const getDeviceTypsList = (params) =>
//   request({
//     url:baseURL+'/device/genre/search',
//     method:'get',
//     params
//   })
export const getDeviceTypsList = params =>
  request({
    url: baseURL1 + "/device/genre/list",
    method: "get",
    params,
  });
// 获取设备型号
// export const getDeviceModelList = (params) =>
//   request({
//     url:baseURL+'/device/model/list',
//     method:'get',
//     params
//   })
export const getDeviceModelList = params =>
  request({
    url: baseURL1 + `/device/${params.genreId}/product/list`,
    method: "get",
    params,
  });
// 设备型号属性列表
export const getModelAttribute = (params) =>
  request({
    url:baseURL+`/device/model/${params.modelId}/associated-attribute`,
    method:'get',
    params
  })
  //获取单设备实时属性
// export const getDeviceAttribute = (params) =>
// request({
//   url:baseURL+`/device/instance/${params.id}/running/attr`,
//   method:'get',
//   params
// })
  export const getDeviceAttribute = params =>
  request({
    url: baseURL2 + `/north/device/detail`,
    method: "get",
    params,
  });
// 获取型号事件列表
export const getModelEvent = (params) =>
  request({
    url:baseURL+`/device/mode/event/list/${params?.modelId || params}`,
    method:'get',
    params
  })


