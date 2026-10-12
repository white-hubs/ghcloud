import request from "../utils/request";
let baseURL = "/api/maintain";

// 巡检计划分页
export const inspectPlan = (params, method) =>
  request({
    // url: baseURL + "/inspect-plan/page",
    url: baseURL + "/inspect-plan/pageV2",
    method: method,
    params,
  });

// 巡检计划详情
export const inspectPlanId = (data, method) =>
  request({
    url: baseURL + "/inspect-plan/" + (data.id ? data.id : data),
    method: method,
    data,
  });

// 巡检计划新增
export const inspectPlanAdd = (data, method = "post") =>
  request({
    // url: baseURL + "/inspect-plan",
    url: baseURL + "/inspect-record/addV2",
    method: method,
    data,
  });

// 巡检计划状态修改
export const inspectPlanStatus = (data, method = "put") =>
  request({
    url: baseURL + `/inspect-plan/${data.id}/start/${data.startFlag}`,
    method: method,
    data,
  });

// 巡检任务

// 巡检任务分页
export const inspectTask = (params, method) =>
  request({
    url: baseURL + "/inspect-task/page",
    method: method,
    params,
  });

// 我的巡检任务分页
export const myInspectTask = (data, method) =>
  request({
    url: baseURL + "/inspect-task/mytask",
    method: method,
    data,
  });

// 巡检任务详情
export const inspectTaskId = (data, method) =>
  request({
    url: baseURL + "/inspect-task/" + (data.id ? data.id : data),
    method: method,
    data,
  });

// 巡检任务启停
export const taskStatus = (data, method) =>
  request({
    url: baseURL + "/inspect-task/" + (data.id ? data.id : data) + "/stop",
    method: method,
    data,
  });

// 巡检台账

// 分页
export const inspectAccount = (params, method) =>
  request({
    url: baseURL + `/inspect-record/page`,
    method: method,
    params,
  });

// 详情
export const inspectAccountId = (data, method) =>
  request({
    url: baseURL + `/inspect-record/${data.id ? data.id : data}`,
    method: method,
    data,
  });

// 巡检配置

// 巡检周期分页
export const inspectCycle = (params, method) =>
  request({
    url: baseURL + `/inspect-cron/page`,
    method: method,
    params,
  });

// 巡检周期列表
export const inspectCycleList = (data, method) =>
  request({
    url: baseURL + `/inspect-cron/list`,
    method: method,
    data,
  });

// 巡检周期--新增
export const inspectCycleAdd = (data, method) =>
  request({
    url: baseURL + `/inspect-cron`,
    method: method,
    data,
  });

// 巡检周期--详情,删除,修改
export const inspectCycleId = (data, method) =>
  request({
    url: baseURL + `/inspect-cron/${data.id ? data.id : data}`,
    method: method,
    data,
  });

// 巡检周期--批量删除
export const inspectCycleBatch = (params, method) =>
  request({
    url: baseURL + `/inspect-cron/batch`,
    method: method,
    params,
  });

// 巡检结果

// 巡检结果分页
export const inspectResult = (params, method) =>
  request({
    url: baseURL + `/inspect-result/page`,
    method: method,
    params,
  });

// 巡检结果列表
export const inspectResultList = (data, method) =>
  request({
    url: baseURL + `/inspect-result/list`,
    method: method,
    data,
  });

// 巡检结果新增
export const inspectResultAdd = (data, method) =>
  request({
    url: baseURL + `/inspect-result`,
    method: method,
    data,
  });

// 巡检结果详情
export const inspectResultId = (data, method) =>
  request({
    url: baseURL + `/inspect-result/${data.id ? data.id : data}`,
    method: method,
    data,
  });

// 巡检结果详情
export const inspectResultOptions = (data, method) =>
  request({
    url: baseURL + `/inspect-result/${data.id ? data.id : data}/options`,
    method: method,
    data,
  });

// 巡检类型

// 分页
export const inspectType = (params, method) =>
  request({
    url: baseURL + `/inspect-type/page`,
    method: method,
    params,
  });

// 列表
export const inspectTypeList = (params, method) =>
  request({
    url: baseURL + `/inspect-type/list`,
    method: method,
    params,
  });

// 详情,编辑
export const inspectTypeId = (data, method) =>
  request({
    url: baseURL + `/inspect-type/${data.id ? data.id : data}`,
    method: method,
    data,
  });

// 新增
export const inspectTypeAdd = (data, method) =>
  request({
    url: baseURL + `/inspect-type`,
    method: method,
    data,
  });

// 巡检标准

// 表格
export const inspectStandard = (params, method = "get") =>
  request({
    url: baseURL + `/inspect-standard/page`,
    method: method,
    params,
  });

// 列表
export const inspectStandardList = (params, method = "get") =>
  request({
    url: baseURL + `/inspect-standard/list`,
    method: method,
    params,
  });

// 删除
export const inspectStandardId = (data, method = "get") =>
  request({
    url: baseURL + `/inspect-standard/${data.id ? data.id : data}`,
    method: method,
    data,
  });

// 批量删除
export const inspectStaBatchDel = (params, method = "get") =>
  request({
    url: baseURL + `/inspect-standard/batch`,
    method: method,
    params,
  });

// 新增
export const inspectStandardAdd = (data, method = "post") =>
  request({
    url: baseURL + `/inspect-standard`,
    method: method,
    data,
  });

// 关联标准新增
export const inspectStandardCon = (data, method = "post") =>
  request({
    url: baseURL + `/inspect-standard/type`,
    method: method,
    data,
  });

// 巡检项分页查询
export const inspectItemTemplatePage = (data, method = "get") =>
  request({
    url: baseURL + `/inspect-item-template/page`,
    method: method,
    params: data,
  });
// 巡检项删除
export const inspectItemTemplateDelete = (data, method = "DELETE") =>
  request({
    url: baseURL + `/inspect-item-template/${data}`,
    method: method,
  });
// 巡检项新增
export const inspectItemTemplateAdd = (data, method = "post") =>
  request({
    url: baseURL + `/inspect-item-template`,
    method: method,
    data,
  });
// 巡检项详情
export const inspectItemTemplateDetail = (data, method = "get") =>
  request({
    url: baseURL + `/inspect-item-template/${data}/detail`,
    method: method,
  });
// 巡检项修改
export const inspectItemTemplateModify = (id, data, method = "PUT") =>
  request({
    url: baseURL + `/inspect-item-template/${id}`,
    method: method,
    data,
  });
// 资产列表
export const getAssemblyClassifyPage = (data, method = "get") =>
  request({
    url: `/api/property/property/detailed/getPropertyDetailedPage`,
    method: method,
    params: data,
  });
// 资产类型
export const getAssemblyClassifyPageType = (data, method = "get") =>
  request({
    url: `/api/property/classify/getAssemblyClassifyPage`,
    method: method,
    params: data,
  });
// 通过对象类型查询标准
export const targetCategory = (data, method = "get") =>
  request({
    url: baseURL + `/inspect-standard/targetCategory/${data.targetCategory}/targetType/${data.targetType}`,
    method: method,
  });
// 巡检计划-新增巡检计划
export const inspectRecordAddV2 = (data, method = "post") =>
  request({
    url: baseURL + `/inspect-record/addV2`,
    method: method,
    data,
  });
// 巡检计划-详情巡检计划
export const inspectPlanDetailV2 = (data, method = "get") =>
  request({
    url: baseURL + `/inspect-plan/detailV2?id=${data}`,
    method: method,
  });
// 巡检计划-详情-对象的巡检标准列表
export const detailStandardV2 = (data, method = "get") =>
  request({
    url: baseURL + `/inspect-record/detail-standardV2?planId=${data.planId}&targetId=${data.targetId}`,
    method: method,
  });
// 巡检档案分页列表
export const targetRecordPage = (data, method = "get") =>
  request({
    url: baseURL + `/inspect-record/target-record-page`,
    method: method,
    params: data,
  });
// 档案详情
export const targetRecordDetail = (data, method = "get") =>
  request({
    url: baseURL + `/inspect-record/target-record-detail?targetId=${data}`,
    method: method,
  });
// 档案详情-记录列表
export const detailRecordPage = (data, method = "get") =>
  request({
    url:
      baseURL +
      `/inspect-record/detail-recordPage?targetId=${data.targetId}&temporary=${data.temporary}&pageNumber=${data.pageNumber}&pageSize=10`,
    method: method,
  });
// 巡检任务分页列表
export const inspectTaskPageV2 = (data, method = "get") => {
  return request({
    url: baseURL + `/inspect-task/pageV2`,
    method: method,
    params: data,
  });
};
// 巡检任务详情
export const inspectTaskDetailV2 = (data, method = "get") => {
  return request({
    url: baseURL + `/inspect-task/detailV2?id=${data}`,
    method: method,
  });
};
// 巡检任务-详情-对象的巡检标准列表
export const taskDetailStandardV2 = (data, method = "get") => {
  return request({
    url: baseURL + `/inspect-task/detail-standardV2`,
    method: method,
    params: data,
  });
};
// 巡检任务-详情-任务拆解
export const inspectTaskSplitV2 = (data, method = "post") => {
  return request({
    url: baseURL + `/inspect-task/splitV2`,
    method: method,
    data,
  });
};
// 巡检任务-详情-执行进度
export const inspectTaskDetailRateV2 = (data, method = "get") => {
  return request({
    url: baseURL + `/inspect-task/detail-rateV2?id=${data}`,
    method: method,
  });
};
//设置默认巡检标准
export const defaultStandard = (data, method = "post") => {
  return request({
    url: baseURL + `/inspect-standard/defaultStandard`,
    method: method,
    data,
  });
};
//巡检计划名称是否重复判断
export const checkPlanNameIsRepeat = (data, method = "get") => {
  return request({
    url: baseURL + `/inspect-plan/checkPlanNameIsRepeat`,
    method: method,
    params: data,
  });
};
