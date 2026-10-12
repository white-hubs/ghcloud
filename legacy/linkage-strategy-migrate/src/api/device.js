import request from "@/utils/request";
let baseURL = "/api/device";
let baseURL1 = "/api/device-center";
let baseURL2 = "/api/iot";

// 分页获取带有h5s协议的设备实例
// export const getVideoPage = params =>
//   request({
//     url: baseURL + `/device/instance/list/schema/h5s`,
//     method: "get",
//     params,
//   });
export const getProductionList = params =>
  request({
    url: baseURL1 + `/iot/product/category-tree`,
    method: "get",
    params,
  });
export const getVideoPage = params =>
  request({
    url: baseURL1 + `/device/instance/associated/videos`,
    method: "get",
    params,
  });
//获取单设备实时属性
// export const getDeviceAttribute = params =>
//   request({
//     url: baseURL + `/device/instance/${params.id}/running/attr`,
//     method: "get",
//     params,
//   });
export const getDeviceAttribute = params =>
  request({
    url: baseURL2 + `/north/device/detail`,
    method: "get",
    params,
  });


// 通过id查询二维码详情
export const getQrcodeDetail = params =>
  request({
    url: baseURL + `/qrcode/${params.id}`,
    method: "get",
    params,
  });
// 获取设备类型
// export const getDeviceTypsList = params =>
//   request({
//     url: baseURL + "/device/genre/search",
//     method: "get",
//     params,
//   });
export const getDeviceTypsList = params =>
  request({
    url: baseURL1 + "/device/genre/list",
    method: "get",
    params,
  });

// 设备实列列表
// export const getIotDeviceList = params =>
//   request({
//     url: baseURL + "/device/instance/list-page",
//     method: "get",
//     params,
//   });
export const getIotDeviceList = params =>
  request({
    url: baseURL1 + "/device/instance/page",
    method: "post",
    params,
  });
export const getInstanceList = (params, method = "get") =>
  request({
    url: baseURL1 + "/device-instance/page",
    method: method,
    params,
  });

// 获取设备型号
// export const getDeviceModelList = params =>
//   request({
//     url: baseURL + "/device/model/list",
//     method: "get",
//     params,
//   });
// export const getDeviceModelList = params =>
//   request({
//     url: baseURL1 + `/device/${params.genreId}/product/list`,
//     method: "get",
//     params,
//   });
export const getDeviceModelList = params =>
  request({
    url: baseURL1 + `/category/${params.genreId}/product/list`,
    method: "get",
    params,
  });

// 获取型号事件列表
export const getModelEvent = params =>
  request({
    url: baseURL + `/device/mode/event/list/${params?.modelId || params}`,
    method: "get",
    params,
  });

// 设备型号属性列表
export const getModelAttribute = params =>
  request({
    url: baseURL + `/device/model/${params.modelId}/associated-attribute`,
    method: "get",
    params,
  });




// 获取设备某个属性的历史变化数据
export const getDeviceHistoryAttr = params =>
  request({
    url: baseURL + `/device/instance/historical/attr`,
    method: "get",
    params,
  });
// 设备属性历史变化数据分页查询
export const getDeviceHistoryAttrPage = params =>
  request({
    url: baseURL + `/device/instance/historical/attribute/change/page`,
    method: "get",
    params,
  });
// 设备实例详情
export const getDeviceDetail = params =>
  request({
    url: baseURL + `/device/instance/${params.deviceInstanceId}`,
    method: "get",
    params,
  });
// 获取设备可写属性
export const getDeviceWritedAttribute = params =>
  request({
    url:
      baseURL +
      `/device/instance/${params.deviceInstanceId}/attribute/writed-able`,
    method: "get",
    params,
  });
//设备关联的监控设备id列表
export const getDeviceInstanceVideo = params =>
  request({
    url:
      baseURL + `/device/instance/${params.deviceInstanceId}/associated/videos`,
    method: "get",
    params,
  });
// 获取但设备关联的监控
export const getDeviceBindVideo = params =>
  request({
    url:
      baseURL + `/device/instance/${params.deviceInstanceId}/associated/videos`,
    method: "get",
    params,
  });
export const deviceOperaLog = params =>
  request({
    url: baseURL + "/device/instance/attribute/change/log/page",
    method: "get",
    params,
  });
//控制设备属性
export const postDeviceInstanceRunning = data =>
  request({
    url: baseURL + `/device/instance/running/attr/control`,
    method: "post",
    data,
  });
//设备安全锁验证
export const deviceControlPasswordConfirm = data =>
  request({
    url: baseURL + `/device/instance/security-lock/verify`,
    method: "post",
    data,
  });
// 是否需要安全锁验证
export const needLock = params =>
  request({
    url:
      baseURL +
      `/device/instance/${params.deviceInstanceId}/security-lock/is-need`,
    method: "get",
    params,
  });

// 业务设置
//系统权重
export const getSystemWeight = params =>
  request({
    url: baseURL + "/device/system/weight",
    method: "get",
    params,
  });
//类型权重
export const getTypeWeight = params =>
  request({
    url: baseURL + "/device/type/weight",
    method: "get",
    params,
  });
// 获取设备健康报警联动动作
export const getHealthyAlarmDetailLinkageAction = params =>
  request({
    url: baseURL + "/device/healthy/alarm/detail",
    method: "get",
    params,
  });
export const getattributechangelogpage = id =>
  request({
    url: baseURL + `/device/instance/${id}/attribute/change/log/page`,
    method: "get",
  });
// 状态持续时长
export const getStatusDuration = params =>
  request({
    url:
      baseURL +
      `/device/instance/${
        params.deviceInstanceId || params
      }/statistics/status-change-runtime`,
    method: "get",
    params,
  });
// 获取设备日志

// 设备健康分析
