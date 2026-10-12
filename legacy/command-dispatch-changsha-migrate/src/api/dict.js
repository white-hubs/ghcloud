import dayjs from "dayjs";

import { getCurrentAddress } from "../cube-map-plugin/amap-plugins/index";
import request from "@/utils/request";
let baseURL = "/api/dictionary";
const dictCode = "COMMAND_DISPATCH_MAP_CONFIG";
const thirdPartyCode = "THIRD_SERVICE";
const correspondServiceCode = "THIRD_SERVICE::correspond_service";
const SERVICE_CONFIGURATION = "SERVICE_CONFIGURATION";
const CHANGSHA_CUSTOM_CONFIG_ITEM_CODE = "CHANGSHA_CUSTOM_CONFIG";
const STATIC_MAP_DEVICE_CONFIG_CODE = "commandDispatchStaticMapDevices";

// 查询字典数据获取调度中心地图配置
export const getDictionaryByItem = () =>
  request({
    url: baseURL + "/getDataDictionaryByItem",
    method: "get",
    params: {
      itemCode: dictCode,
    },
  });

// 查询“长沙定制化配置”租户字典中的指挥调度静态设备点位集合
export const getStaticMapDeviceConfigs = () =>
  request({
    url: baseURL + "/getDataDictionaryByItem",
    method: "get",
    params: {
      itemCode: CHANGSHA_CUSTOM_CONFIG_ITEM_CODE,
      code: STATIC_MAP_DEVICE_CONFIG_CODE,
    },
  });

// 查询访问端别名和扩展入口配置
export const getTerminalAliasConfigs = () =>
  request({
    url: baseURL + "/getDataDictionaryByItem",
    method: "get",
    params: {
      itemCode: "TERMINAL_ALIAS",
    },
  });
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
    } catch (error) {
      console.log("获取定位失败,请检查当前是否安全域名及高德地图key是否配置正确!", error);
    }
  }
  if (watermarkConfig.includes("timestamp")) {
    config.watermark = config.watermark
      ? `${config.watermark} ${dayjs().format("YYYY-MM-DD HH:mm:ss")}`
      : dayjs().format("YYYY-MM-DD HH:mm:ss");
  }
  return config;
};
