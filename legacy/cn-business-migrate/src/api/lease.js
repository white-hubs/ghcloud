import request from "@/utils/request";
let baseURL = "/api/lease";

//获取收费项目列表
export const getChargeProjects = (params, type) =>
  request({
    url: baseURL + "/charge-projects",
    method: "get",
    params,
  });

//新增收费项目
export const postChargeProject = (params, type) =>
  request({
    url: baseURL + "/charge-project",
    method: "post",
    params,
  });

//修改收费项目
export const putChargeProject = (params, type) =>
  request({
    url: baseURL + `/charge-project/${params.id}`,
    method: "put",
    params,
  });

//删除收费项目
export const deleteChargeProject = (params, type) =>
  request({
    url: baseURL + `/charge-project/${params.id}`,
    method: "delete",
  });

//获取费用模板列表
export const getCostTmps = (params, type) =>
  request({
    url: baseURL + "/cost-tmps",
    method: "get",
    params,
  });

//新增费用模板
export const postCostTmp = (params, type) =>
  request({
    url: baseURL + "/cost-tmp",
    method: "post",
    params,
  });

//修改费用模板
export const putCostTmp = (params, type) =>
  request({
    url: baseURL + `/cost-tmp/${params.id}`,
    method: "put",
    params,
  });

//修改费用模板状态
export const putCostTmpStatus = (params, type) =>
  request({
    url: baseURL + `/cost-tmp/${params.id}/${params.enabled}`,
    method: "put",
  });

//费用模板详情
export const getCostTmp = (id, type) =>
  request({
    url: baseURL + `/cost-tmp/${id}`,
    method: "get",
  });

//删除费用模板
export const deleteCostTmp = (params, type) =>
  request({
    url: baseURL + `/cost-tmp/${params.id}`,
    method: "delete",
  });

//获取档位费用列表
export const getStallCosts = (params, type) =>
  request({
    url: baseURL + "/stall-costs",
    method: "get",
    params,
  });

//获取档位费用详情
export const getStallCost = (id, type) =>
  request({
    url: baseURL + `/stall-cost/${id}`,
    method: "get",
  });

//保存档位费用
export const postStallCost = (params, type) =>
  request({
    url: baseURL + "/stall-cost",
    method: "post",
    params,
  });

//批量保存档位费用
export const postStallCostBatch = (params, type) =>
  request({
    url: baseURL + "/stall-cost/batch",
    method: "post",
    params,
  });

//获取档位信息详情
export const getStall = (id, type) =>
  request({
    url: baseURL + `/stall/${id}`,
    method: "get",
  });

//获取承租方式列表
export const getLeaseModes = (params, type) =>
  request({
    url: baseURL + `/lease-modes`,
    method: "get",
    params,
  });

//保存承租方式
export const postLeaseMode = (params, type) =>
  request({
    url: baseURL + `/lease-mode`,
    method: "post",
    params,
  });

//保存租赁配置
export const postLeaseConfig = (params, type) =>
  request({
    url: baseURL + `/lease-config`,
    method: "post",
    params,
  });

//租赁配置详情
export const getLeaseConfig = () =>
  request({
    url: baseURL + `/lease-config`,
    method: "get",
  });

//档位租赁分页查询
export const getStallLease = (params, type) =>
  request({
    url: baseURL + `/stall-lease`,
    method: type,
    params,
  });

//获取我发起的档位租赁信息
export const getStallLeaseStarted = (params, type) =>
  request({
    url: baseURL + `/stall-lease/started`,
    method: type,
    params,
  });

//获取待我处理的档位租赁信息
export const getStallLeasePending = (params, type) =>
  request({
    url: baseURL + `/stall-lease/pending`,
    method: type,
    params,
  });

//档位租赁详情
export const getStallLeaseId = (id, type) =>
  request({
    url: baseURL + `/stall-lease/${id}`,
    method: type,
  });

//档位租赁新增/档位租赁更新
export const postStallLease = (params, type) =>
  request({
    url: baseURL + `/stall-lease`,
    method: type,
    params,
  });

//档位租赁提交
export const putStallLeaseSubmit = (params, type) =>
  request({
    url: baseURL + `/stall-lease/submit`,
    method: "put",
    params,
  });

//档位租赁作废
export const getStallLeaseCodeVoided = (code, type) =>
  request({
    url: baseURL + `/stall-lease/${code}/voided`,
    method: "get",
  });

//档位租赁审核
export const getStallLeaseCodeAudit = (params, type) =>
  request({
    url: baseURL + `/stall-lease/${params.code}/audit`,
    method: "get",
    params,
  });

//档位退租分页查询
export const getStallRelease = (params, type) =>
  request({
    url: baseURL + `/stall-release`,
    method: type,
    params,
  });

//档位退租信息详情
export const getStallReleaseId = (id, type) =>
  request({
    url: baseURL + `/stall-release/${id}`,
    method: "get",
  });

//获取商户下的档位租赁合同
export const getStallReleaseMine = (merchantId, type) =>
  request({
    url: baseURL + `/stall-lease/${merchantId}/mine`,
    method: "get",
  });

//档位退租新增/档位退租更新
export const postStallRelease = (params, type) =>
  request({
    url: baseURL + `/stall-release`,
    method: type,
    params,
  });

//获取合同下的档位租赁信息
export const getStallLeaseContractMine = (params, type) =>
  request({
    url: baseURL + `/stall-lease/contract/mine`,
    method: "get",
    params,
  });

//获取我发起的档位退租信息
export const getStallReleaseStarted = (params, type) =>
  request({
    url: baseURL + `/stall-release/started`,
    method: type,
    params,
  });

//获取待我处理的档位退租信息
export const getStallReleasePending = (params, type) =>
  request({
    url: baseURL + `/stall-release/pending`,
    method: type,
    params,
  });

//档位退租提交
export const putStallReleaseSubmit = (params, type) =>
  request({
    url: baseURL + `/stall-release/submit`,
    method: "put",
    params,
  });

//档位租赁作废
export const getStallReleaseCodeVoided = (code, type) =>
  request({
    url: baseURL + `/stall-release/${code}/voided`,
    method: "get",
  });

// //档位租赁审核
export const getStallReleaseCodeAudit = (params, type) =>
  request({
    url: baseURL + `/stall-release/${params.code}/audit`,
    method: "get",
    params,
  });

// 档位接口 - 档位删除, 档位ID查询
export const getStallId = (id, method = "delete") =>
  request({
    url: baseURL + "/stall/" + id,
    method: method,
  });

// 档位接口 - 档位新增,档位更新
export const postStall = (params, method = "post") =>
  request({
    url: baseURL + "/stall",
    method: method,
    params,
  });

// 档位接口 - 档位删除, 档位ID查询
export const deleteStall = (id, method = "delete") =>
  request({
    url: baseURL + "/stall/" + id,
    method: method,
  });

// 档位接口 - 档位分页查询含收费项目
export const getLeasePage = (params, method = "get") =>
  request({
    url: "/api/mdata/stall/page",
    method: method,
    params,
  });