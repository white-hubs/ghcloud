import request from "../utils/request";
let baseURL = "/api/dispatch";

// 获取租户的调度台配置
export const getDispatchConfig = (params, method = "get") =>
  request({
    url: baseURL + `/dispatch-config`,
    method: "get",
  });

// 调度设备状态列表
export const getDispatchDeviceList = (params, method = "get") =>
  request({
    url: baseURL + `/dispatch-device/detail/list`,
    method: "get",
    params,
  });

// 圈选查询设备
export const getDispatchCircleDevice = (params, method = "get") =>
  request({
    url: baseURL + `/dispatch-platform/circle/device`,
    method: "get",
    params,
  });
export const getDispatchCircleBroadcast = (params, method = "get") =>
  request({
    url: `/api/broadcast/broadcast-devices/circle`,
    method: "get",
    params,
  });
// GPS轨迹查询
export const mapTrajectoryList = (params) =>
  request({
    url: baseURL + "/dispatch-platform/gps/list",
    method: "get",
    params,
  });
/**获取员工 */

export const tenantUserList = (params, method = "get") => {
  if (window.config.feature?.usePersonal) {
    return request({
      url: "/api/personnel" + "/staff/state/page",
      method: method,
      params: { ...params, enabled: true },
    });
  } else {
    return request({
      url: "/api/ouaa" + "/authenticated/user-under-tenant/page",
      method: method,
      params: {
        ...params,
        enabled: true,
      },
    });
  }
};
export const getRoleList = (params, method = "get") =>
  request({
    url: baseURL + `/authenticated/product/role/page`,
    method: method,
    params,
  });
