import { request, service } from "@/service/index";
const baseURL = "/energymanagement";
enum URL {
  Comprehensive = "/energy-daily-usage/stat/category/all",
  EnergyTrend = "/energy-daily-summary/trend",
  EnergyUnityTrend = "/energy-daily-usage/dc/stat/trend",
  EnergyConsumptionTrend = "/energy-consumption-trend",
  EnergyProportionStatistics = "/energy-daily-usage/project/stat/category",
  EnergyDirection = "/energy-direction",
  EnergyCollectPeriod = "/energy-collect-period/batch",
  EnergyCollectPeriodItype = "/energy-collect-period/itype",
  EnergyCollectConfig = "/energy-collect-config/page",
  FuelListPage = "/fuel/select/list",
  UpdateEnergyCollectConfig = "/energy-collect-config/",
  AreaProjectTree = "/area-project/tree",
  AreaProject = "/area-project",
  EnergyCollectConfigList = "/energy-collect-config/list",
  SubItemPage = "/energy-project/page",
  SubItemTreePage = "/energy-project/tree/special",
  SubItemList = "/energy-project/list",
  EnergyProject = "/energy-project",
  EnergyProjectTree = "/energy-project/tree",
}
/**
 *
 * 年用能列表
 */
export const EnergyUsagePage = async (params?: any): Promise<Service.RequestResult> => {
  return request.get(baseURL + "/yearEnergy/page", {
    params: {
      ...params,
    },
  });
};
/**
 *
 * 新增年用能
 */
export const AddUsageSetting = async (params?: any): Promise<Service.RequestResult> => {
  return request.post(baseURL + "/yearEnergy/add", { ...params });
};
/**
 *
 * 编辑年用能
 */
export const EditUsageSetting = async (params?: any): Promise<Service.RequestResult> => {
  return request.put(baseURL + "/yearEnergy/edit", { ...params });
};
/**
 *
 * 删除年用能
 */
export const DelUsageSetting = async (params: any): Promise<Service.RequestResult> => {
  return request.delete(baseURL + "/yearEnergy/remove", { params });
};
/**
 *
 * 能耗分类统计用量（碳排和综合）
 */

export const Comprehensive = async (params?: any): Promise<Service.RequestResult> => {
  return request.get(baseURL + URL.Comprehensive, {
    params: {
      ...params,
    },
  });
};
/**
 *
 *   碳排/综合趋势统计（按时间）
 */
export const EnergyTrend = async (params?: any): Promise<Service.RequestResult> => {
  return request.get(baseURL + URL.EnergyTrend, {
    params: {
      ...params,
    },
  });
};
/**
 *
 *   碳排/综合趋势统计（按时间）
 */
export const EnergyUnityTrend = async (params?: any): Promise<Service.RequestResult> => {
  return request.get(baseURL + URL.EnergyUnityTrend, {
    params: {
      ...params,
    },
  });
};
/**
 *
 * 能耗分项占比统计
 */
export const EnergyProportionStatistics = async (params?: any): Promise<Service.RequestResult> => {
  return request.get(baseURL + URL.EnergyProportionStatistics, {
    params: {
      ...params,
    },
  });
};
/**
 * 日月年碳排/综合能耗统计
 *
 */
export const CarbonStatisticsData = async (params?: any): Promise<Service.RequestResult> => {
  return request.get(baseURL + "/energy-daily-usage/stat/carbon/dmy", {
    params: {
      ...params,
    },
  });
};
/**
 * 碳排/综合按照时间和类型统计
 *
 */
export const CarbonClassifyStatisticsData = async (params?: any): Promise<Service.RequestResult> => {
  return request.get(baseURL + "/energy-daily-usage/dc/stat/time/category", {
    params: {
      ...params,
    },
  });
};
/**
 * 用能趋势-近30日
 *
 */

export const EnergyConsumptionTrend = async (): Promise<Service.RequestResult> => {
  return request.get(baseURL + URL.EnergyConsumptionTrend);
};

/**
 *
 * 能源走向-近30日
 */
export const EnergyDirection = async (): Promise<Service.RequestResult> => {
  return request.get(baseURL + URL.EnergyDirection);
};
/**
 *
 * 峰平谷时段设置
 */
export const PeakValleyPeriods = async (params: any): Promise<Service.RequestResult> => {
  return request.post(baseURL + URL.EnergyCollectPeriod, {
    ...params,
  });
};
/**
 *
 * 通过仪表类型查询时段定义
 */
export const EnergyCollectPeriodItype = async (code: string): Promise<Service.RequestResult> => {
  return request.get(baseURL + URL.EnergyCollectPeriodItype + `/${code}`);
};
/**
 *
 * 能耗分类配置列表
 */
export const EnergyCollectConfigList = async (): Promise<Service.RequestResult> => {
  return request.get(baseURL + URL.EnergyCollectConfigList);
};
/**
 *
 * 能耗分类配置分页查询
 */
export const ClassifySettingsPage = async (): Promise<Service.RequestResult> => {
  return request.get(baseURL + URL.EnergyCollectConfig);
};
/**
 *
 * 燃料类型下拉列表
 */
export const FuelListPage = async (params: any): Promise<Service.RequestResult> => {
  return request.get(baseURL + URL.FuelListPage, { params });
};
/**
 *
 * 能耗分类配置修改
 */
export const UpdateClassifySettings = async (params: any): Promise<Service.RequestResult> => {
  return request.put(baseURL + URL.UpdateEnergyCollectConfig + `${params.id}`, { ...params });
};
/**
 *
 * 区域分项树
 */
export const AreaProjectTree = async (params: any): Promise<Service.RequestResult> => {
  return request.get(baseURL + URL.AreaProjectTree, { params });
};
/**
 *
 * 区域分项配置添加
 */
export const AreaProjectAdd = async (params: any): Promise<Service.RequestResult> => {
  return request.post(baseURL + URL.AreaProject, {
    ...params,
  });
};
/**
 *
 * 区域分项配置编辑
 */
export const AreaProjectUpdate = async (params: any): Promise<Service.RequestResult> => {
  return request.put(baseURL + URL.AreaProject + `/${params.id}`, {
    ...params,
  });
};
/**
 *
 * 区域分项配置删除
 */
export const AreaProjectDelete = async (id: string): Promise<Service.RequestResult> => {
  return request.delete(baseURL + URL.AreaProject + `/${id}`);
};
/**
 *
 * 能耗分项分页
 */
export const SubItemPage = async (params?: any): Promise<Service.RequestResult> => {
  return request.get(baseURL + URL.SubItemPage, {
    params: {
      ...params,
    },
  });
};
/**
 *
 * 能耗分项分页（树）
 */
export const SubItemTreePage = async (params?: any): Promise<Service.RequestResult> => {
  return request.get(baseURL + URL.SubItemTreePage, {
    params: {
      ...params,
    },
  });
};
/**
 *
 * 能耗分项列表
 */
export const SubItemList = async (params?: any): Promise<Service.RequestResult> => {
  return request.get(baseURL + URL.SubItemList, {
    params: {
      ...params,
    },
  });
};
/**
 *
 * 仪表管理分页（关联设备）
 */
export const DeviceList = async (params: any): Promise<Service.RequestResult> => {
  return request.get(baseURL + "/meter-device/page", { params });
};
/**
 *
 * 能耗分项添加
 */
export const EnergyProjectAdd = async (params: any): Promise<Service.RequestResult> => {
  return request.post(baseURL + URL.EnergyProject, {
    ...params,
  });
};
/**
 *
 * 能耗分项修改
 */
export const EnergyProjectUpdate = async (params: any): Promise<Service.RequestResult> => {
  return request.put(baseURL + URL.EnergyProject + `/${params.id}`, {
    ...params,
  });
};
/**
 *
 * 能耗分项删除
 */
export const EnergyProjectDelete = async (id: string): Promise<Service.RequestResult> => {
  return request.delete(baseURL + URL.EnergyProject + `/${id}`);
};
/**
 *
 * 能耗分项树
 */
export const EnergyProjectTree = async (params: any): Promise<Service.RequestResult> => {
  return request.get(baseURL + URL.EnergyProjectTree, { params });
};
/**
 *
 * 分项绑定设备
 */
export const SubItemReferDevice = async (id: string, params: any): Promise<Service.RequestResult> => {
  return request.post(baseURL + `/energy-project/${id}/refer/device`, params);
};
/**
 *
 * 区域绑定设备
 */
export const AreaReferDevice = async (id: string, params: any): Promise<Service.RequestResult> => {
  return request.post(baseURL + `/area-project/${id}/refer/device`, params);
};
/**
 *
 * 通过区域分项ID查询关联的设备
 */
export const AreaReferDeviceById = async (id: string): Promise<Service.RequestResult> => {
  return request.get(baseURL + `/area-project/${id}/refer/device`);
};
/**
 *
 * 通过能耗分项ID查询关联的设备
 */
export const SubItemReferDeviceById = async (id: string): Promise<Service.RequestResult> => {
  return request.get(baseURL + `/energy-project/${id}/refer/device`);
};

/**
 *
 * 获取设备的最新读数
 */
export const deviceReadUpdate = async (id: string): Promise<Service.RequestResult> => {
  return request.get(baseURL + `/meter-device/${id}/update/prop/value`);
};
/**
 *
 * 添加换表记录
 */
export const TableRecordUpdate = async (params: any): Promise<Service.RequestResult> => {
  return request.post(baseURL + `/meter-device-change-log`, { ...params });
};

/**
 *
 * 抄表记录分页查询
 */
export const ReadRecordPage = async (params: any): Promise<Service.RequestResult> => {
  return request.get(baseURL + `/meter-read-log/page`, { params });
};
/**
 *
 * 保存或修改抄表记录
 */
export const ReadRecordUpdate = async (params: any): Promise<Service.RequestResult> => {
  return request.post(baseURL + `/meter-read-log`, { ...params });
};
/**
 *
 * 删除抄表记录（单条和批量使用同一接口）
 */
export const ReadRecordDelete = async (dateRangeList: Array<{ time: string; deviceId: number }>): Promise<Service.RequestResult> => {
  return request.post(baseURL + `/meter-read-log/remove-batch`, { dateRangeList });
};
/*
 *
 *通过ID获取设备详情
 */
export const deviceDetail = async (id: string): Promise<Service.RequestResult> => {
  return request.get(baseURL + `/meter-device/detail/${id}`);
};
/*
 *
 * 批量更新设备读数
 */
export const meterDeviceBatchUpdate = async (idList: number[]): Promise<Service.RequestResult> => {
  return request.put(baseURL + `/meter-device/update/prop/value/batch`, { idList });
};
/*
 *
 *分类能耗报表
 */
export const classifyEnergyPage = async (params: any): Promise<Service.RequestResult> => {
  return request.get(baseURL + `/energy-daily-usage/category`, {
    params: {
      ...params,
    },
  });
};
/*
 *
 *分项能耗报表
 */
export const subItemEnergyPage = async (params: any): Promise<Service.RequestResult> => {
  return request.get(baseURL + `/energy-daily-usage/project`, {
    params: {
      ...params,
    },
  });
};
/*
 *
 *能耗分类日报表导出
 */
export const classifyExport = async (data: any): Promise<Service.RequestResult> => {
  return service.post(`/api${baseURL}/energy-daily-usage/export`, data);
};
/*
 *
 *抄表日志报表导出
 */
export const readLogExport = async (params: any): Promise<Service.RequestResult> => {
  return service.get(`/api${baseURL}/meter-read-log/export`, { params });
};
/*
 *
 *读数记录模板下载
 */
export const readRecordTemplateExport = async (data: unknown): Promise<Service.RequestResult> => {
  return service.post(`/api${baseURL}/meter-read-log/download-template`, data);
};
/*
 *
 *读数记录批量导入
 */
export const readRecordImport = async (data: unknown): Promise<unknown> => {
  return request.post(`${baseURL}/meter-read-log/import-excel`, data);
};
/*
 *
 *能耗分项日报表导出（分项、区域）
 */
export const subItemExport = async (data: any): Promise<Service.RequestResult> => {
  return service.post(`/api${baseURL}/energy-daily-usage/project/export`, data);
};
/*
 *
 *能耗分类用量模板
 */
export const templateExport = async (): Promise<Service.RequestResult> => {
  return service.post(`/api${baseURL}/energy-daily-usage/template`);
};
/*
 *
 *导入能耗分类用量
 */
export const classifyimport = async (data: unknown): Promise<unknown> => {
  return request.post(`${baseURL}/energy-daily-usage/import`, data);
};
/**
 *
 * 日月年统计用量
 */
export const EnergySituation = async (params: any): Promise<Service.RequestResult> => {
  return request.get(baseURL + "/energy-daily-usage/stat/dmy", {
    params: {
      ...params,
    },
  });
};
/**
 *
 * 能耗分项趋势
 */
export const UsageTrend = async (params: any): Promise<Service.RequestResult> => {
  return request.get(baseURL + "/energy-daily-usage/project/stat/trend", {
    params: {
      ...params,
    },
  });
};
/**
 *
 * 能耗分项分布统计
 */
export const UsageSubItemTrend = async (params: any): Promise<Service.RequestResult> => {
  return request.get(baseURL + "/energy-daily-usage/project/stat/time/category", {
    params: {
      ...params,
    },
  });
};
/**
 *
 * 能耗分项占比统计
 */
export const UsageSubItemProperty = async (params: any): Promise<Service.RequestResult> => {
  return request.get(baseURL + "/energy-daily-usage/project/stat/category", {
    params: {
      ...params,
    },
  });
};
/**
 *
 * 能耗流向
 */
export const EnergyFlowDirection = async (params: any): Promise<Service.RequestResult> => {
  return request.get(baseURL + "/energy-daily-usage-project/area/stat/flow", {
    params: {
      ...params,
    },
  });
};
/**
 *
 * 获取所有已导入设备的deviceId
 */
export const SearchDevice = async (): Promise<Service.RequestResult> => {
  return request.get(baseURL + "/meter-device/all/deviceId");
};
// 仪表下拉列表
export const getMeterDeviceList = async (params: any): Promise<Service.RequestResult> => {
  return request.get(baseURL + "/meter-device/drop-down/list", {
    params: {
      ...params,
    },
  });
};
// 设备用能趋势
export const getDeviceUseTrend = async (params: any): Promise<Service.RequestResult> => {
  return request.get(baseURL + "/device-use-trend", {
    params: {
      ...params,
    },
  });
};
// 设备用能排行
export const getDeviceUseRanking = async (params: any): Promise<Service.RequestResult> => {
  return request.get(baseURL + "/device-use-ranking", {
    params: {
      ...params,
    },
  });
};
