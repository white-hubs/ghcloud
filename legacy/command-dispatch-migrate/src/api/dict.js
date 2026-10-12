import moment from "moment";

import { getCurrentAddress } from "../cube-map-plugin/amap-plugins/index";
import request from "@/utils/request";
let baseURL = "/api/dictionary";
const dictCode = "COMMAND_DISPATCH_MAP_CONFIG";
const priorityDepartmentDictCode = "COMMAND_DISPATCH_PRIORITY_DEPARTMENT";
const priorityDepartmentConfigCode = "departmentId";
const thirdPartyCode = "THIRD_SERVICE";
const correspondServiceCode = "THIRD_SERVICE::correspond_service";
const SERVICE_CONFIGURATION = "SERVICE_CONFIGURATION";

// 查询字典数据获取调度中心地图配置
export const getDictionaryByItem = () =>
  request({
    url: baseURL + "/getDataDictionaryByItem",
    method: "get",
    params: {
      itemCode: dictCode,
    },
  });

/** 获取调度中心优先选择部门 id */
export const getPriorityDepartmentId = async () => {
  try {
    const result = await request({
      url: baseURL + "/getDataDictionaryByItem",
      method: "get",
      params: {
        itemCode: priorityDepartmentDictCode,
      },
    });
    if (!result?.length) {
      return "";
    }
    const config = result.find((item) => item.code === priorityDepartmentConfigCode);
    return config?.variable || "";
  } catch {
    return "";
  }
};
// 查询字典数据
const getThirdPartyDictionary = () =>
  request({
    url: baseURL + "/getDataDictionaryByItem",
    method: "get",
    params: {
      itemCode: thirdPartyCode,
      code: correspondServiceCode,
    },
  });

export const getCorrespondServiceDict = async () => {
  const res = await getThirdPartyDictionary();
  const variable = res[0].variable ? JSON.parse(res[0].variable) : null;
  if (!variable) {
    return null;
  }
  if (!variable.config) {
    return null;
  }
  return variable.providerCode;
};
// 获取三方配置
export const getServiceConfiguration = () =>
  request({
    url: baseURL + "/getDataDictionaryByItem",
    method: "get",
    params: {
      itemCode: SERVICE_CONFIGURATION,
    },
  });
// 获取报警处理配置
export const getAlarmConfiguration = async () => {
  const result = await request({
    url: baseURL + "/getDataDictionaryByItem",
    method: "get",
    params: {
      itemCode: "ALARM_HANDLE_CONFIG",
      code: "uploadPicConfig",
    },
  });
  if (!result) return;
  if (!result.length) return;
  const config = {
    imageRules: [],
    watermark: "",
  };
  const variable = JSON.parse(result[0].variable);
  if (variable.requirePic) {
    config.imageRules.push({
      required: true,
      message: "请上传图片",
    });
  } else {
    config.imageRules = [];
  }
  const watermarkConfig = variable.watermark;
  if (watermarkConfig.includes("location")) {
    try {
      config.watermark = await getCurrentAddress();
    } catch (error) {}
  }
  if (watermarkConfig.includes("timestamp")) {
    config.watermark = config.watermark
      ? `${config.watermark} ${moment().format("YYYY-MM-DD HH:mm:ss")}`
      : moment().format("YYYY-MM-DD HH:mm:ss");
  }
  return config;
};
