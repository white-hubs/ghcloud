import request from "../utils/request";
let baseURL = "/api/maintain";
//  || process.env.NODE_ENV === "loc"
// if (process.env.NODE_ENV === "lzy" || process.env.NODE_ENV === "loc") {
//   baseURL = "http://192.168.2.158:3100/inspect";
// }

/* 二维码管理 */

// 二维码分页
export const QRCodeList = (params, method) =>
  request({
    url: baseURL + "/qrcode/page",
    method: method,
    params,
  });

// 二维码新增
export const QRCodeAdd = (params, method) =>
  request({
    url: baseURL + "/qrcode/add",
    method: method,
    params,
  });

// 二维码修改
export const QRCodeUpdateId = (params, method) =>
  request({
    url: baseURL + "/qrcode/update/" + (params.id ? params.id : params),
    method: method,
    params,
  });

// 二维码删除,详情
export const QRCodeId = (params, method) =>
  request({
    url: baseURL + "/qrcode/" + (params.id ? params.id : params),
    method: method,
    params,
  });

// 二维码批量删除
export const QRCodeBatchDel = (params, method) =>
  request({
    url: baseURL + "/qrcode/batchdelete?ids=" + params.ids,
    method: method,
    params,
  });

// 现场点管理

// 现场点分页
export const inspectSpoint = (params, method) =>
  request({
    url: baseURL + "/inspect-scene-point/page",
    method: method,
    params,
  });

// 现场点添加
export const addInspectSpoint = (params, method) =>
  request({
    url: baseURL + "/inspect-scene-point/add",
    method: method,
    params,
  });

// 现场点修改
export const editInspectSpoint = (params, method) =>
  request({
    url: baseURL + "/inspect-scene-point/update/" + (params.id ? params.id : params),
    method: method,
    params,
  });

// 现场点删除
export const inspectSpointDel = (params, method) =>
  request({
    url: baseURL + "/inspect-scene-point/" + (params.id ? params.id : params),
    method: method,
    params,
  });

// 现场点批量删除
export const inspectSpointBatchDel = (params, method) =>
  request({
    url: baseURL + "/inspect-scene-point/batchdelete?ids=" + params.ids,
    method: method,
    params,
  });

// 现场点详情
export const inspectSpointDetail = (params, method) =>
  request({
    url: baseURL + "/inspect-scene-point/" + (params.id ? params.id : params),
    method: method,
    params,
  });

// 现场点类型

// 现场点类型分页
export const inspectSpointType = (params, method) =>
  request({
    url: baseURL + "/inspect-spoint-type/page",
    method: method,
    params,
  });

// 现场点类型列表
export const inspectSpointTypeList = (params, method) =>
  request({
    url: baseURL + "/inspect-spoint-type/list",
    method: method,
    params,
  });

// 现场点类型添加
export const addInspectSpointType = (params, method) =>
  request({
    url: baseURL + "/inspect-spoint-type/add",
    method: method,
    params,
  });

// 现场点类型修改
export const editInspectSpointType = (params, method) =>
  request({
    url: baseURL + "/inspect-spoint-type/update/" + (params.id ? params.id : params),
    method: method,
    params,
  });

// 现场点类型批量删除
export const delInspectSpointType = (params, method) =>
  request({
    url: baseURL + "/inspect-spoint-type/batchdelete?ids=" + params.ids,
    method: method,
    params,
  });

// 现场点类型删除,详情
export const inspectSpointTypeId = (params, method) =>
  request({
    url: baseURL + "/inspect-spoint-type/" + (params.id ? params.id : params),
    method: method,
    params,
  });

// 巡检配置

// 巡检结果添加
export const addInspectResult = (params, method) =>
  request({
    url: baseURL + "/inspect-result/add",
    method: method,
    params,
  });

// 巡检结果编辑
export const editInspectResult = (params, method) =>
  request({
    url: baseURL + "/inspect-result/update/" + (params.id ? params.id : params),
    method: method,
    params,
  });

// 巡检结果详情,删除
export const inspectResultBatchDel = (params, method) =>
  request({
    url: baseURL + "/inspect-result/batchdelete?ids=" + params.ids,
    method: method,
    params,
  });

// 巡检类型或巡检标准

// 巡检类型/标准分页
export const inspectPage = (params, method) =>
  request({
    url: baseURL + "/inspect-category/page",
    method: method,
    params,
  });

// 巡检类型/标准分页
export const inspectList = (params, method) =>
  request({
    url: baseURL + "/inspect-category/list",
    method: method,
    params,
  });

// 巡检类型/标准添加
export const inspectAdd = (params, method) =>
  request({
    url: baseURL + "/inspect-category/add",
    method: method,
    params,
  });

// 巡检类型/标准修改
export const inspectEdit = (params, method) =>
  request({
    url: baseURL + "/inspect-category/update/" + (params.id ? params.id : params),
    method: method,
    params,
  });

// 巡检类型/标准删除,详情
export const inspectId = (params, method) =>
  request({
    url: baseURL + "/inspect-category/" + (params.id ? params.id : params),
    method: method,
    params,
  });

// 巡检类型/标准批量删除
export const inspectBatchDel = (params, method) =>
  request({
    url: baseURL + "/inspect-category/batchdelete?ids=" + params.ids,
    method: method,
    params,
  });

// 巡检对象分类

// 巡检对象分类
export const inspectObj = (params, method) =>
  request({
    url: baseURL + "/inspect/object/category",
    method: method,
    params,
  });

// 巡检标准关联标准
export const inspectStandardConnect = (params, method) =>
  request({
    url: baseURL + "/inspect-standard/type/add",
    method: method,
    params,
  });

// 巡检标准批量删除
export const inspectStandardBatchDel = (params, method) =>
  request({
    url: baseURL + "/inspect-standard/batchdelete?ids=" + params.ids,
    method: method,
    params,
  });

// 巡检标准修改
export const inspectStandardEdit = (params, method) =>
  request({
    url: baseURL + "/inspect-standard/update/" + (params.id ? params.id : params),
    method: method,
    params,
  });

// 巡检计划

// 巡检计划添加
export const addInspectPlan = (params, method) =>
  request({
    url: baseURL + "/inspect-task/add",
    method: method,
    params,
  });

// 巡检计划等级
export const inspectPlanLevel = (params, method = "post") =>
  request({
    url: baseURL + "/inspect/task/level",
    method: method,
    params,
  });

// 巡检周期批量删除
export const inspectCycleDel = (params, method) =>
  request({
    url: baseURL + "/inspect-cron/batchdelete?ids=" + params.ids,
    method: method,
    params,
  });

// 巡检周期新增
export const addIspectCycle = (params, method) =>
  request({
    url: baseURL + "/inspect-cron/add",
    method: method,
    params,
  });

// 巡检任务

// 我的任务
export const myTask = (params, method) =>
  request({
    url: baseURL + "/inspect-record/mytask",
    method: method,
    params,
  });

// 巡检任务详情
export const taskId = (params, method) =>
  request({
    url: baseURL + "/inspect-record/" + (params.id ? params.id : params),
    method: method,
    params,
  });

// 巡检任务及对象详情
export const taskObjDetail = (params, method) =>
  request({
    url: baseURL + "/inspect-record/object/detail",
    method: method,
    params,
  });

// 巡检点跟踪
export const taskPointFollow = (params, method) =>
  request({
    url: baseURL + "/inspect-record/" + (params.id ? params.id : params) + "/trace",
    method: method,
    params,
  });

// 巡检点详情
export const taskPointDetail = (params, method) =>
  request({
    url: baseURL + "/inspect-record/point",
    method: method,
    params,
  });

// 巡检统计

// 巡检异常统计
export const inspectAbnormal = (params, method) =>
  request({
    url: baseURL + "/inspect-record/exception/stat",
    method: method,
    params,
  });

// 巡检任务中的异常统计
export const inspectTaskError = (params, method) =>
  request({
    url: baseURL + "/inspect-record/exception",
    method: method,
    params,
  });

// 巡检计划状态统计
export const inspectPlanStatusData = (params, method) =>
  request({
    url: baseURL + "/inspect-task/status/stat",
    method: method,
    params,
  });

// 巡检任务状态统计
export const inspectTaskStatusData = (params, method) =>
  request({
    url: baseURL + "/inspect-record/status/stat",
    method: method,
    params,
  });

// 近30日实际巡检点统计
export const clearTrueSpoint = (params, method) =>
  request({
    url: baseURL + "/inspect-record/point/stat",
    method: method,
    params,
  });

// 近30日异常点数统计
export const clearErrorSpoint = (params, method) =>
  request({
    url: baseURL + "/inspect-record/exception/point/stat",
    method: method,
    params,
  });

// 巡检异常详情
export const errorSpointDetal = (params, method) =>
  request({
    url: baseURL + "/inspect-record/object/exception/detail?id=" + (params.id ? params.id : params),
    method: method,
    params,
  });

// // 获取巡检点详情（只包含异常项）
// export const errorSpointDetal = (params, method) =>
//   request({
//     url: baseURL + "/inspect-record/object/exception/detail?id=" + (params.id ? params.id : params),
//     method: method,
//     params,
//   });
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
