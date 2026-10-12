import request from "@/utils/request";
let baseURL = "/api/door";
import { cubeDeviceCenterService } from "./service";

// 企业名录分页
export const getEnterpriseDirectory = (params) =>
  request({
    url: baseURL + "/enterprise/directory/page",
    method: "get",
    params,
  });

// ----------门禁总览-----------------
export const getDoorRanking = (params) =>
  request({
    url: baseURL + "/getDoorRanking",
    method: "get",
    params,
  });
export const getDoorEvents = (params) =>
  request({
    url: baseURL + "/getDoorEvents",
    method: "get",
    params,
  });
export const passedTodayNum = (params) =>
  request({
    url: baseURL + "/passedTodayNum",
    method: "get",
    params,
  });
export const getDoorTend = (params, timeFlag) =>
  request({
    url: baseURL + "/getDoorTend/" + timeFlag,
    method: "get",
    params,
  });

// ----------门禁设备-----------------
// 验证设备是否需要密码
export const generDeviceIsWord = (params, deviceInstanceId) =>
  request({
    url: "/api/device" + `/device/instance/${deviceInstanceId}/security-lock/is-need`,
    method: "get",
    params,
  });
//   设备密码验证
export const controlDoorverify = (data) =>
  request({
    url: "/api/device" + "/device/instance/security-lock/verify",
    method: "post",
    data,
  });
export const generDevice = (params) =>
  request({
    url: baseURL + "/devices",
    method: "get",
    params,
  });
// 门禁类型
export const getDoorType = (params) =>
  request({
    url: baseURL + "/getDoorType",
    method: "get",
    params,
  });
//   导入设备
export const addDoorDevices = (data) =>
  request({
    url: baseURL + "/addDoorDevices",
    method: "post",
    data,
  });
//   门禁设备分页
export const getDoorDevicePage = (params) =>
  request({
    url: baseURL + "/getDoorDevicePage",
    method: "get",
    params,
  });

// ---------- 门禁气体联动 -----------------
let lcBaseURL = "/api/changsha-xialing";
const doorGasLinkageDetailRequests = new Map();

export const getDoorGasLinkageConfigPage = (params) =>
  request({
    url: lcBaseURL + "/liangcang/door-gas-linkage/config/page",
    method: "get",
    params,
  });

export const getDoorGasLinkageConfigDetail = (doorDeviceId) => {
  if (doorGasLinkageDetailRequests.has(doorDeviceId)) {
    return doorGasLinkageDetailRequests.get(doorDeviceId);
  }
  const detailRequest = request({
    url: lcBaseURL + `/liangcang/door-gas-linkage/doors/${doorDeviceId}/config`,
    method: "get",
  }).finally(() => doorGasLinkageDetailRequests.delete(doorDeviceId));
  doorGasLinkageDetailRequests.set(doorDeviceId, detailRequest);
  return detailRequest;
};

export const getDoorGasLinkageGasList = (params) =>
  getDoorGasLinkageConfigDetail(params.doorDeviceId).then((detail) =>
    (detail.gasConfigs || []).map((item) => ({
      ...item,
      gasName: { O2: "氧气（O₂）", CO2: "二氧化碳（CO₂）", PH3: "磷化氢（PH₃）" }[item.gasType] || item.gasType,
      threshold:
        item.lowerThreshold != null
          ? `下限 ${item.lowerThreshold} ${item.unit || "ppm"} / 上限 ${item.upperThreshold ?? "—"} ${item.unit || "ppm"}`
          : item.upperThreshold != null
            ? `上限 ${item.upperThreshold} ${item.unit || "ppm"}`
            : "—",
      validationStatus: item.configured ? "已绑定，参与校验" : "未绑定，不校验",
    })),
  );

export const saveDoorGasLinkageConfig = (doorDeviceId, data) =>
  request({
    url: lcBaseURL + `/liangcang/door-gas-linkage/doors/${doorDeviceId}/config`,
    method: "put",
    data,
  });
//   删除
export const removeDoorDevice = (id, params) =>
  request({
    url: baseURL + `/removeDoorDevice/${id}`,
    method: "delete",
    params,
  });

//   批量删除
export const removeDoorDeviceBatch = (params) =>
  request({
    url: baseURL + "/removeDoorDeviceBatch?ids=" + params,
    method: "delete",
  });
//   门禁控制
export const controlDoor = (data) =>
  request({
    url: baseURL + "/controlDoor",
    method: "post",
    data,
  });
// ---------- 通行记录-----------------

export const getDoorEventRecord = (params) =>
  request({
    url: baseURL + "/getDoorEventRecord",
    method: "get",
    params,
  });

export const getToDayEventTrend = (params) =>
  request({
    url: baseURL + "/getToDayEventTrend",
    method: "get",
    params,
  });
// ---------- 异常事件-----------------
export const getAbnormalEvent = (params) =>
  request({
    url: baseURL + "/getAbnormalEvent",
    method: "get",
    params: {
      keyword: "",
      date: "",
      period: "",
      cascaderIds: "",
      item: "",
      sort: "",
      ...params,
    },
  });
// 通过设备id查询状态
export const inspectgetStatus = (params, method = "get") =>
  request({
    url: baseURL + `/getStatus/${params.id}`,
    method: method,
    params,
  });

export const getDeviceProduct = (params, method = "get") => cubeDeviceCenterService.getIotProductCategoryTree();

export const getDeviceList = (params) => cubeDeviceCenterService.getDeviceInstancePageAll(params);
export const getProductAll = (params, method = "get") => cubeDeviceCenterService.getProductListAll();
