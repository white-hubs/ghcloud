import request from "../utils/request";
let baseURL = "/api/energymanagement";

// 综合能耗
export const getComprehensiveEnergy = (params, method = "get") =>
  request({
    url: baseURL + `/comprehensive-energy/${params.id ? params.id : params}`,
    method: "get",
  });

// 能耗趋势
export const getEnergyTrend = (params, method = "get") =>
  request({
    url: baseURL + `/energy-trend`,
    method: "get",
    params,
  });

// 分项能耗
export const getEnergyProject = (params, method = "get") =>
  request({
    url: baseURL + `/energy-project`,
    method: "get",
    params,
  });

// 区域分项
export const getEnergyErea = (params, method = "get") =>
  request({
    url: baseURL + `/energy-erea`,
    method: "get",
    params,
  });
