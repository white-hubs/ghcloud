import request from "../utils/request";
let baseURL = "/api/maintain";

// 隐患单

// 列表
export const hiddenDanger = (params, method) =>
  request({
    url: baseURL + `/hidden-danger/page`,
    method: method,
    params,
  });

// 新增
export const hiddenDangerAdd = (params, method) =>
  request({
    url: baseURL + `/hidden-danger`,
    method: method,
    params,
  });

// 详情,删除
export const hiddenDangerId = (params, method) =>
  request({
    url: baseURL + `/hidden-danger/${params.id ? params.id : params}`,
    method: method,
    params,
  });

// 根据隐患单主键获取隐患单确认信息
export const hiddenDangerConfInfo = (params, method) =>
  request({
    url: baseURL + `/hidden-danger-confirm/${params.id ? params.id : params}/hidden-danger`,
    method: method,
    params,
  });

// 根据隐患单主键获取隐患单关闭信息
export const hiddenDangerCloseInfo = (params, method) =>
  request({
    url: baseURL + `/hidden-danger-closed/${params.id ? params.id : params}/hidden-danger`,
    method: method,
    params,
  });

// 确认
export const hiddenDangerConfirm = (params, method) =>
  request({
    url: baseURL + `/hidden-danger/${params.hiddenDangerId ? params.hiddenDangerId : params}/confirm`,
    method: method,
    params,
  });

// 关闭
export const hiddenDangerClose = (params, method) =>
  request({
    url: baseURL + `/hidden-danger/${params.hiddenDangerId ? params.hiddenDangerId : params}/closed`,
    method: method,
    params,
  });

// 隐患工单

// 列表
export const hiddenDangerOrder = (params, method) =>
  request({
    url: baseURL + `/hidden-danger/ticket/page`,
    method: method,
    params,
  });

// 详情
export const hiddenDangerOrderId = (params, method) =>
  request({
    url: baseURL + `/hidden-danger/${params.id ? params.params : params}/ticketId`,
    method: method,
    params,
  });

// 处理
export const hiddenDangerOrderDeal = (params, method) =>
  request({
    url: baseURL + `/hidden-danger/${params.id ? params.params : params}/confirm`,
    method: method,
    params,
  });

// 关闭
export const hiddenDangerOrderClose = (params, method) =>
  request({
    url: baseURL + `/hidden-danger/${params.id ? params.params : params}/closed`,
    method: method,
    params,
  });

// 隐患程度

// 列表
export const dangerDegree = (params, method) =>
  request({
    url: baseURL + `/hidden-danger-level/list`,
    method: method,
    params,
  });

// 新增
export const dangerDegreeAdd = (params, method) =>
  request({
    url: baseURL + `/hidden-danger-level`,
    method: method,
    params,
  });

// 编辑 删除
export const dangerDegreeId = (params, method) =>
  request({
    url: baseURL + `/hidden-danger-level/${params.id ? params.id : params}`,
    method: method,
    params,
  });

// 隐患类型

// 分类

// 列表
export const dangerCategory = (params, method) =>
  request({
    url: baseURL + `/hidden-danger-category/list`,
    method: method,
    params,
  });

// 新增
export const dangerCategoryAdd = (params, method) =>
  request({
    url: baseURL + `/hidden-danger-category`,
    method: method,
    params,
  });

// 编辑 删除
export const dangerCategoryId = (params, method) =>
  request({
    url: baseURL + `/hidden-danger-category/${params.id ? params.id : params}`,
    method: method,
    params,
  });

// 类别

// 列表
export const dangerType = (params, method) =>
  request({
    url: baseURL + `/hidden-danger-type/list`,
    method: method,
    params,
  });

// 新增
export const dangerTypeAdd = (params, method) =>
  request({
    url: baseURL + `/hidden-danger-category`,
    method: method,
    params,
  });

// 编辑 删除
export const dangerTypeId = (params, method) =>
  request({
    url: baseURL + `/hidden-danger-category/${params.id ? params.id : params}`,
    method: method,
    params,
  });

// 隐患配置

// 通知方式枚举
export const dangerNoticeMethod = (params, method) =>
  request({
    url: baseURL + `/hidden-danger-config/notice/list`,
    method: method,
    params,
  });

// 隐患业务配置
export const dangerTrafConf = (data, method) =>
  request({
    url: baseURL + `/hidden-danger-config/batch`,
    method: method,
    data,
  });

// 隐患业务配置列表
export const dangerTrafConfList = (data, method = "get") =>
  request({
    url: baseURL + `/hidden-danger-config/list`,
    method: method,
    data,
  });

// 故障

// 故障单
export const faultList = (data, method) =>
  request({
    url: baseURL + `/fault/page`,
    method: method,
    data,
  });

// 故障单提交
export const faultAdd = (data, method) =>
  request({
    url: baseURL + `/fault`,
    method: method,
    data,
  });

// 故障单删除
export const faultId = (data, method) =>
  request({
    url: baseURL + `/fault/${data.id ? data.id : data}`,
    method: method,
    data,
  });

// 故障单确认
export const faultConfirm = (data, method) =>
  request({
    url: baseURL + `/fault/${data.faultId ? data.faultId : data}/confirm`,
    method: method,
    data,
  });

// 故障单确认信息
export const faultConfInfo = (data, method) =>
  request({
    url: baseURL + `/fault-confirm/${data.id ? data.id : data}/fault`,
    method: method,
    data,
  });

// 故障工单

// 表格
export const faultOrderList = (data, method) =>
  request({
    url: baseURL + `/fault/ticket/page`,
    method: method,
    data,
  });

// 详情
export const faultOrderDetail = (data, method) =>
  request({
    url: baseURL + `/fault/${data.id ? data.id : data}/ticketId`,
    method: method,
    data,
  });

// 关闭信息
export const faultOrderCloInfo = (data, method) =>
  request({
    url: baseURL + `/fault-closed/${data.id ? data.id : data}/fault`,
    method: method,
    data,
  });

// 故障配置

// 故障类型

// 表格
export const faultType = (data, method) =>
  request({
    url: baseURL + `/fault-type/list`,
    method: method,
    data,
  });

// 新增
export const faultTypeAdd = (data, method) =>
  request({
    url: baseURL + `/fault-type`,
    method: method,
    data,
  });

// 新增
export const faultTypeId = (data, method) =>
  request({
    url: baseURL + `/fault-type/${data.id ? data.id : data}`,
    method: method,
    data,
  });

// 故障案例

// 表格
export const faultCase = (data, method) =>
  request({
    url: baseURL + `/fault-case/page`,
    method: method,
    data,
  });

// 添加
export const faultCaseAdd = (data, method) =>
  request({
    url: baseURL + `/fault-case`,
    method: method,
    data,
  });

// 删除
export const faultCaseId = (data, method) =>
  request({
    url: baseURL + `/fault-case/${data.id ? data.id : data}`,
    method: method,
    data,
  });

// 设备下的案例
export const caseUnderDevice = (data, method) =>
  request({
    url: baseURL + `/fault-case/device-type/list`,
    method: method,
    data,
  });

// 故障业务配置

// 业务配置获取
export const faultTraffic = (data, method) =>
  request({
    url: baseURL + `/fault-config/list`,
    method: method,
    data,
  });

// 业务配置peizhi
export const faultTrafficSet = (data, method) =>
  request({
    url: baseURL + `/fault-config`,
    method: method,
    data,
  });
