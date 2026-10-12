import request from "../service/request";
const baseURL = "/api/lingchuan-hik";

// 罪犯状态统计
export const criminalStatisticsStatus = () =>
  request({
    url: baseURL + `/hik/criminal/statistics/status`,
    method: "get",
  });

// 获取罪犯分页列表
export const hikCriminalPage = (params) =>
  request({
    url: baseURL + `/hik/criminal/page`,
    method: "get",
    params
  });

// 按级别分组统计罪犯数量
export const criminalStatisticsGroup = () =>
  request({
    url: baseURL + `/hik/criminal/statistics/level/group`,
    method: "get",
  });

// 获取罪犯数量
export const criminalStatisticsCount = () =>
  request({
    url: baseURL + `/hik/criminal/statistics/count`,
    method: "get",
  });
// 获取民警总数
export const policeStatisticsCount = () =>
  request({
    url: baseURL + `/hik/police/statistics/count`,
    method: "get",
  });

// 海康今日外来人员原因统计
export const personnelTodayReasonStat = () =>
  request({
    url: baseURL + `/hik/external/personnel/today/reason/stat`,
    method: "get",
  });
// 今日超时未出外来人员分页列表
export const todayTimeoutLeavePage = (params) =>
  request({
    url: baseURL + `/hik/external/personnel/today/timeout/leave/page`,
    method: "get",
    params
  });
// 区域当前最新点名人数
export const currentRollCallUserStat = (areaId) =>
  request({
    url: baseURL + `/hik/area/${areaId}/current/roll-call/user/stat`,
    method: "get",
  });
// 点名记录分页列表
export const personRollCallPage = (params) =>
  request({
    url: baseURL + `/hik/person/roll-call/page`,
    method: "get",
    params
  });
// 海康民警今日遗留人员分页列表
export const policeTodayLeavePage = (params) =>
  request({
    url: baseURL + `/hik/police/today/leave/page`,
    method: "get",
    params
  });
// 海康区域今日用户统计
export const areaTodayUserStat = (params) =>
  request({
    url: baseURL + `/hik/area/today/user/stat`,
    method: "get",
    params
  });
// 今日遗留外来人员分页列表
export const externalPersonnelTodayLeavePage = (params) =>
  request({
    url: baseURL + `/hik/external/personnel/today/leave/page`,
    method: "get",
    params
  });

