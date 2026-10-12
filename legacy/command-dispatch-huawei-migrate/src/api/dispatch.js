import request from "@/utils/request";
let baseURL = "/api/dispatch";

export const addGroupMembers = (data) =>
  request({
    url: baseURL + `/dispatch-device-group/${data.code}/add/member?deviceCodes=${data.deviceCodes}`,
    method: "post",
  });
// 获取调度组列表
export const getDispatchGroupList = (params, method = "get") =>
  request({
    url: baseURL + `/dispatch-device-group/list`,
    method: "get",
    params,
  });
// 查询分组详情
export const getGroupDetailById = (id, method = "get") =>
  request({
    url: baseURL + ` /dispatch-device-group/${id}`,
    method: "get",
  });
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
    url: baseURL + "/dispatch-platform/gps/history/page",
    method: "get",
    params,
  });
/**获取岗位 */
export const positionList = (params, method = "get") =>
  request({
    url: "/api/ouaa/authenticated/position/list",
    method: method,
    params,
  });
/**获取员工 */

export const tenantUserList = (params, method = "get") => {
  return request({
    url: "/api/ouaa" + "/authenticated/user-under-tenant/page",
    method: "post",
    data: {
      ...params,
      enabled: true,
    },
  });
};

export const getRoleList = (params, method = "get") =>
  request({
    url: baseURL + `/authenticated/product/role/page`,
    method: method,
    params,
  });
