import request from "@ghcloud-legacy/bimops-fe-web-migrate-lib/lib/utils/request";
let baseURL = "/api/park-management";
let trafficBaseURL = "/api/traffic-detection";
import { CubeFlowService } from "@ghcloud/cube-stream-engine-service";

import { filterEmptyProperties } from "../utils/common";
import { authStore } from "./auth-store";

const exportExcel = async (url, data) => {
  const search = new URLSearchParams();
  Object.keys(data || {}).forEach((key) => {
    const value = data[key];
    if (value !== undefined && value !== null && value !== "") {
      search.append(key, value);
    }
  });
  const token = sessionStorage.getItem("GH-Token");
  const enterprise = sessionStorage.getItem("GH-NowEnterprise");
  const headers = { terminal: window.config?.terminal || "" };
  if (token) {
    headers.Authorization = `Bearer ${JSON.parse(token).access_token}`;
  }
  if (enterprise) {
    headers.tenant = JSON.parse(enterprise).code;
  }
  const response = await fetch(`${url}?${search.toString()}`, { method: "GET", headers });
  if (!response.ok) {
    throw new Error("导出失败");
  }
  return response.blob();
};
// 车场列表

export const getParkingInfors = (params) =>
  request({
    url: baseURL + "/parking-infos",
    method: "get",
    params,
  });
// 获取车位信息
export const getParkingInformation = (params) =>
  request({
    url: baseURL + "/parking-info",
    method: "get",
    params,
  });

//出入记录列表 & 停车监控-实时出入记录
export const getAccessRecords = (params) =>
  request({
    url: baseURL + "/parking-access-records",
    method: "get",
    params,
  });

// 车场停车数趋势图
export const getParkingNum = (params) =>
  request({
    url: baseURL + "/parking-access-records/today-in-trend",
    method: "get",
    params,
  });

// 滞留车辆列表
export const getStrandedVehicles = (params) =>
  request({
    url: baseURL + "/parking-access-stranded-records",
    method: "get",
    params,
  });

// 今日车辆出入数量统计
export const getCarNum = (params) =>
  request({
    url: baseURL + "/parking-access-record/today-access-total",
    method: "get",
    params,
  });

// 停车场出入场趋势图
export const getParkingLotEntrance = (params) =>
  request({
    url: baseURL + "/parking-access-record/today-access-trend",
    method: "get",
    params,
  });

/** 车流统计汇总 */
export const getParkingVehicleFlowSummary = (data) =>
  request({
    url: baseURL + "/parking-access-records/statistics/vehicle-flow/summary",
    method: "get",
    data,
  });

/** 车流趋势 */
export const getParkingVehicleFlowTrend = (data) =>
  request({
    url: baseURL + "/parking-access-records/statistics/vehicle-flow/trend",
    method: "get",
    data,
  });

/** 停车场车辆排行 */
export const getParkingVehicleFlowAreaRank = (data) =>
  request({
    url: baseURL + "/parking-access-records/statistics/vehicle-flow/area-rank",
    method: "get",
    data,
  });

/** 车辆详情趋势 */
export const getParkingVehicleFlowDetailTrend = (data) =>
  request({
    url: baseURL + "/parking-access-records/statistics/vehicle-flow/detail-trend",
    method: "get",
    data,
  });

/** 车辆详情列表 */
export const getParkingVehicleFlowDetails = (data) =>
  request({
    url: baseURL + "/parking-access-records/statistics/vehicle-flow/details",
    method: "get",
    data,
  });

/** 导出停车场车辆排行 */
export const exportParkingVehicleFlowAreaRank = (data) =>
  exportExcel(baseURL + "/parking-access-records/statistics/vehicle-flow/area-rank/export", data);

/** 导出车辆详情列表 */
export const exportParkingVehicleFlowDetails = (data) =>
  exportExcel(baseURL + "/parking-access-records/statistics/vehicle-flow/details/export", data);

// ----------收费----------
//收费记录列表
export const getCharges = (params) =>
  request({
    url: baseURL + "/parking-pay-records",
    method: "get",
    params,
  });

// 今日停车缴费金额
export const getParkingPayment = (params) =>
  request({
    url: baseURL + "/parking-pay/today-total",
    method: "get",
    params,
  });

// 今日停车缴费趋势
export const getParkingFeeTrends = (params) =>
  request({
    url: baseURL + "/parking-pay/today-trend",
    method: "get",
    params,
  });
//新增车场列表(new)
export const createParkingList = (params) =>
  request({
    url: baseURL + "/parking-infos",
    method: "post",
    params,
  });
//编辑车场列表(new)
export const updateParkingList = (params) =>
  request({
    url: baseURL + "/parking-infos",
    method: "put",
    params,
  });
//车场列表(new)
export const getParkingList = (params) =>
  request({
    url: baseURL + "/parking-infos-page",
    method: "get",
    params,
  });
//设备列表
export const getDeviceList = (params) =>
  request({
    url: baseURL + `/parking-infos/${params.id}/devices/page`,
    method: "get",
    params,
  });

// 绑定设备
export const bindDevices = (data) =>
  request({
    url: baseURL + `/parking-infos/${data.parkingId}/devices`,
    method: "post",
    data,
  });
// 获取车场详情
export const getParkingDetail = (data) =>
  request({
    url: baseURL + `/parking-infos/${data.id}`,
    method: "get",
    data,
  });
// 获取车场视角详情
export const getParkingViewDetail = (data) =>
  request({
    url: baseURL + `/parking-infos/${data.id}/view-config`,
    method: "get",
    data,
  });
// 获取车场设备详情
export const getParkingDevicesDetail = (data) =>
  request({
    url: baseURL + `/parking-infos/${data.id}/devices/page`,
    method: "get",
    data,
  });

// 获取车场第三方数据分页列表
export const getParkingListWithConfig = (params) =>
  request({
    url: baseURL + "/parking-infos/page/with-has-dock-config",
    method: "get",
    params,
  });

// 获取车场第三方配置
export const getDockConfig = (id) =>
  request({
    url: baseURL + `/parking-infos/${id}/dock-config`,
    method: "get",
  });

// 保存车场第三方配置
export const saveDockConfig = (data) =>
  request({
    url: baseURL + `/parking-infos/${data.id}/dock-config`,
    method: "post",
    data,
  });

// 删除车场
export const deleteParking = (id) =>
  request({
    url: baseURL + `/parking-infos/${id}`,
    method: "delete",
  });

// 获取车场监控
export const getMonitorDevices = (data) =>
  request({
    url: baseURL + `/parking/monitor-devices`,
    method: "get",
    data,
  });
// 获取人流量区域列表
export const getTrafficAreasList = (data) =>
  request({
    url: trafficBaseURL + `/traffic-detection-areas/page`,
    method: "get",
    data,
  });
// 导出人流量区域列表
export const exportTrafficAreas = (data) =>
  new Promise(async (resolve, reject) => {
    try {
      const search = new URLSearchParams();
      Object.keys(data || {}).forEach((key) => {
        const value = data[key];
        if (value !== undefined && value !== null && value !== "") {
          search.append(key, value);
        }
      });
      const token = sessionStorage.getItem("GH-Token");
      const enterprise = sessionStorage.getItem("GH-NowEnterprise");
      const headers = {
        terminal: window.config?.terminal || "",
      };
      if (token) {
        headers.Authorization = `Bearer ${JSON.parse(token).access_token}`;
      }
      if (enterprise) {
        headers.tenant = JSON.parse(enterprise).code;
      }
      const response = await fetch(`${trafficBaseURL}/traffic-detection-areas/export?${search.toString()}`, {
        method: "GET",
        headers,
      });
      if (!response.ok) {
        throw new Error("导出失败");
      }
      const blob = await response.blob();
      resolve(blob);
    } catch (error) {
      reject(error);
    }
  });
// 获取人流量区域设备
export const getTrafficAreasDevices = (data) =>
  request({
    url: trafficBaseURL + `/traffic-detection-areas/${data.id}/devices/page`,
    method: "get",
    data,
  });
// 新增人流量区域列表
export const cerateTrafficAreas = (data) =>
  request({
    url: trafficBaseURL + `/traffic-detection-areas`,
    method: "post",
    data,
  });
// 编辑人流量区域列表
export const updateTrafficAreas = (data) =>
  request({
    url: trafficBaseURL + `/traffic-detection-areas`,
    method: "put",
    data,
  });
// 人流量区域详情
export const getTrafficAreasDetail = (data) =>
  request({
    url: trafficBaseURL + `/traffic-detection-areas/${data.id}`,
    method: "get",
    data,
  });
// 人流量区域视角配置详情
export const getTrafficViewDetail = (data) =>
  request({
    url: trafficBaseURL + `/traffic-detection-areas/${data.id}/view-config`,
    method: "get",
    data,
  });
// 人流量区域删除
export const deleteTrafficView = (id) =>
  request({
    url: trafficBaseURL + `/traffic-detection-areas/${id}`,
    method: "delete",
  });
// 人流区域绑定设备
export const trafficBindDevices = (data) =>
  request({
    url: baseURL + `/traffic-detection-areas/${data.parkingId}/devices`,
    method: "post",
    data,
  });
// 人流区域监控设备
export const getTrafficMonitorDevices = (data) =>
  request({
    url: baseURL + `/traffic-detection-areas/monitor-devices`,
    method: "get",
    data,
  });

// 设置人流区域设备半径
export const modifyTrafficAreaDevice = (data) =>
  request({
    url: trafficBaseURL + `/traffic-detection-areas/devices/modify`,
    method: "put",
    data,
  });

/** 区域人流统计趋势列表 */
export const getTrafficAreaStatisticsTrend = (data) =>
  request({
    url: trafficBaseURL + `/traffic-detection-areas/statistics/areas/trend`,
    method: "get",
    data,
  });

/** 人流区域列表 */
export const getTrafficAreas = (data) =>
  request({
    url: trafficBaseURL + `/traffic-detection-areas`,
    method: "get",
    data,
  });

/** 人流详情趋势 */
export const getTrafficAreaPersonFlowDetailTrend = (data) =>
  request({
    url: trafficBaseURL + `/traffic-detection-areas/statistics/person-flow/detail-trend`,
    method: "get",
    data,
  });

/** 人流详情列表 */
export const getTrafficAreaPersonFlowDetails = (data) =>
  request({
    url: trafficBaseURL + `/traffic-detection-areas/statistics/person-flow/details`,
    method: "get",
    data,
  });

/** 导出人流详情列表 */
export const exportTrafficAreaPersonFlowDetails = (data) =>
  new Promise(async (resolve, reject) => {
    try {
      const search = new URLSearchParams();
      Object.keys(data || {}).forEach((key) => {
        const value = data[key];
        if (value !== undefined && value !== null && value !== "") {
          search.append(key, value);
        }
      });
      const token = sessionStorage.getItem("GH-Token");
      const enterprise = sessionStorage.getItem("GH-NowEnterprise");
      const headers = {
        terminal: window.config?.terminal || "",
      };
      if (token) {
        headers.Authorization = `Bearer ${JSON.parse(token).access_token}`;
      }
      if (enterprise) {
        headers.tenant = JSON.parse(enterprise).code;
      }
      const response = await fetch(`${trafficBaseURL}/traffic-detection-areas/statistics/person-flow/details/export?${search.toString()}`, {
        method: "GET",
        headers,
      });
      if (!response.ok) {
        throw new Error("导出失败");
      }
      const blob = await response.blob();
      resolve(blob);
    } catch (error) {
      reject(error);
    }
  });

/** 人流统计汇总 */
export const getTrafficAreaPersonFlowSummary = (data) =>
  request({
    url: trafficBaseURL + `/traffic-detection-areas/statistics/person-flow/summary`,
    method: "get",
    data,
  });

/** 累计人次趋势 */
export const getTrafficAreaPersonFlowTrend = (data) =>
  request({
    url: trafficBaseURL + `/traffic-detection-areas/statistics/person-flow/trend`,
    method: "get",
    data,
  });

/** 区域人流排行 */
export const getTrafficAreaPersonFlowAreaRank = (data) =>
  request({
    url: trafficBaseURL + `/traffic-detection-areas/statistics/person-flow/area-rank`,
    method: "get",
    data,
  });

/** 导出区域人流统计趋势 */
export const exportTrafficAreaStatisticsTrend = (data) =>
  new Promise(async (resolve, reject) => {
    try {
      const search = new URLSearchParams();
      Object.keys(data || {}).forEach((key) => {
        const value = data[key];
        if (value !== undefined && value !== null && value !== "") {
          search.append(key, value);
        }
      });
      const token = sessionStorage.getItem("GH-Token");
      const enterprise = sessionStorage.getItem("GH-NowEnterprise");
      const headers = {
        terminal: window.config?.terminal || "",
      };
      if (token) {
        headers.Authorization = `Bearer ${JSON.parse(token).access_token}`;
      }
      if (enterprise) {
        headers.tenant = JSON.parse(enterprise).code;
      }
      const response = await fetch(`${trafficBaseURL}/traffic-detection-areas/statistics/areas/trend/export?${search.toString()}`, {
        method: "GET",
        headers,
      });
      if (!response.ok) {
        throw new Error("导出失败");
      }
      const blob = await response.blob();
      resolve(blob);
    } catch (error) {
      reject(error);
    }
  });

/** 导出区域人流排行 */
export const exportTrafficAreaPersonFlowAreaRank = (data) =>
  new Promise(async (resolve, reject) => {
    try {
      const search = new URLSearchParams();
      Object.keys(data || {}).forEach((key) => {
        const value = data[key];
        if (value !== undefined && value !== null && value !== "") {
          search.append(key, value);
        }
      });
      const token = sessionStorage.getItem("GH-Token");
      const enterprise = sessionStorage.getItem("GH-NowEnterprise");
      const headers = {
        terminal: window.config?.terminal || "",
      };
      if (token) {
        headers.Authorization = `Bearer ${JSON.parse(token).access_token}`;
      }
      if (enterprise) {
        headers.tenant = JSON.parse(enterprise).code;
      }
      const response = await fetch(
        `${trafficBaseURL}/traffic-detection-areas/statistics/person-flow/area-rank/export?${search.toString()}`,
        {
          method: "GET",
          headers,
        },
      );
      if (!response.ok) {
        throw new Error("导出失败");
      }
      const blob = await response.blob();
      resolve(blob);
    } catch (error) {
      reject(error);
    }
  });

// //车场列表(new)
// export const getParkingList = params =>
// request({
//   url: baseURL + "/parking-infos-page",
//   method: "get",
//   params,
// });
// //设备列表
// export const getDeviceList = params =>
// request({
//   url: baseURL + `/parking-infos/${params.id}/devices/page`,
//   method: "get",
//   params,
// });

// // 绑定设备
// export const bindDevices = data =>
// request({
//   url: baseURL + `/parking-infos/${data.parkingId}/devices/bind`,
//   method: "post",
//   data,
// });

// 车辆审批列表
export const getFlowProcessList = (params) => {
  return new Promise(async (resolve, reject) => {
    try {
      const cubeFlowService = new CubeFlowService(authStore);
      const payload = filterEmptyProperties(params);
      const result = await cubeFlowService.getFlowProcessPage(payload);
      resolve(result);
    } catch (error) {
      resolve([]);
    }
  });
};
