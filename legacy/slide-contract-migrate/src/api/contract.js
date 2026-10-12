import request from "@/utils/request";
let baseURL = "/api/contract";
//获取合同类型列表
export const getContractTypes = (params,type) =>
  request({
    url: baseURL + "/contract-types",
    method: "get",
    params,
  });

//新增合同类型列表
export const postContractType = (params,type) =>
  request({
    url: baseURL + "/contract-type",
    method: "post",
    data: params,
  });

//修改合同类型
export const putContractType = (params,type) =>
  request({
    url: baseURL + `/contract-type/${params.id}`,
    method: "put",
    params,
  });

//删除合同类型
export const deleteContractType = (params,type) =>
  request({
    url: baseURL + `/contract-type/${params.id}`,
    method: "delete",
  });

//甲方信息列表
export const getPartys = (params,type) =>
  request({
    url: baseURL + `/partys/`,
    method: "get",
    params,
  });

//甲方信息列表状态
export const putPartyStatus = (params,type) =>
  request({
    url: baseURL + `/party/${params.id}/${params.enabled}`,
    method: "put",
  });

//甲方信息详情
export const getParty = (id,type) =>
  request({
    url: baseURL + `/party/${id}`,
    method: "get",
  });

//修改甲方信息
export const putParty = (params,type) =>
  request({
    url: baseURL + `/party/${params.id}`,
    method: "put",
    data: params,
  });

//新增甲方信息
export const postParty = (params,type) =>
  request({
    url: baseURL + `/party/`,
    method: "post",
    data: params,
  });

//删除甲方信息
export const deleteParty = (id,type) =>
  request({
    url: baseURL + `/party/${id}`,
    method: "delete",
  });

//合同模板列表
export const getContractTmps = (params,type) =>
  request({
    url: baseURL + `/contract-tmps`,
    method: "get",
    params,
  });

//删除合同模板列表
export const deleteContractTmp = (params,type) =>
  request({
    url: baseURL + `/contract-tmp/${params.id}`,
    method: "delete",
    params,
  });

//合同模板列表状态
export const putContractTmp = (params,type) =>
  request({
    url: baseURL + `/contract-tmp/${params.id}/${params.enabled}`,
    method: "put",
  });

//新增合同模板
export const postContractTmp = (params,type) =>
  request({
    url: baseURL + `/contract-tmp`,
    method: "post",
    data: params,
  });

//修改合同模板
export const putContractTmpId = (params,type) =>
  request({
    url: baseURL + `/contract-tmp/${params.id}`,
    method: "put",
    data: params,
  });

//获取合同列表
export const getcontractLeases = (params,type) =>
  request({
    url: baseURL + `/contract-leases`,
    method: "get",
    params,
  });

//获取合同详情
export const getcontractLease = (id,type) =>
  request({
    url: baseURL + `/contract-lease/${id}`,
    method: "get",
  });

//合同作废
export const putContractLeaseAolish = (params,type) =>
  request({
    url: baseURL + `/contract-lease/abolish/${params.id}`,
    method: "put",
    data: params,
  });

//合同停止
export const putContractLeaseStop = (params,type) =>
  request({
    url: baseURL + `/contract-lease/stop/${params.id}`,
    method: "put",
    params,
  });

//合同签订
export const putContractLeaseSigned = (params,type) =>
  request({
    url: baseURL + `/contract-lease/signed/${params.id}`,
    method: "put",
    data: params,
  });

//合同修改
export const putContractLease = (params,type) =>
  request({
    url: baseURL + `/contract-lease/${params.id}`,
    method: "put",
    data: params,
  });

//合同新增
export const postContractLease = (params,type) =>
  request({
    url: baseURL + `/contract-lease`,
    method: "post",
    data: params,
  });

//合同续签
export const postContractLeaseRenewal = (params,type) =>
  request({
    url: baseURL + `/contract-lease/renewal`,
    method: "post",
    data: params,
  });

//合同补录
export const postContractLeaseSupplementary = (params,type) =>
  request({
    url: baseURL + `/contract-lease/supplementary`,
    method: "post",
    data: params,
  });

//生成费用小计
export const postContractLeaseCostDetail = (params,type) =>
  request({
    url: baseURL + `/contract-lease-cost-detail/web`,
    method: "post",
    data: params,
  });

//费用明细列表
export const getContractLeaseCostDetails = (params,type) =>
  request({
    url: baseURL + `/contract-lease-cost-details`,
    method: "get",
    params,
  });

//生成费用明细
export const postContractLeaseCostDetailId = (id,type) =>
  request({
    url: baseURL + `/contract-lease-cost-detail/${id}`,
    method: "post",
  });

//费用明细状态数量统计
export const getContractLeaseCostDetailStatistics = (id,type) =>
  request({
    url: baseURL + `/contract-lease-cost-details/statistics/${id}`,
    method: "get",
  });

//缴费单列表
export const getPaymentNotices = (params,type) =>
  request({
    url: baseURL + `/payment-notices`,
    method: "get",
    params,
  });

//缴费单详情
export const getPaymentNotice = (id,type) =>
  request({
    url: baseURL + `/payment-notice/${id}`,
    method: "get",
  });

//新增缴费单
export const postPaymentNotice = (params,type) =>
  request({
    url: baseURL + `/payment-notice`,
    method: "post",
    data: params,
  });

//支付缴费单
export const postPaymentNoticePay = (params,type) =>
  request({
    url: baseURL + `/payment-notice/pay/${params.id}`,
    method: "post",
    data: params,
  });

//作废缴费单
export const postPaymentNoticeAbolish = (id,type) =>
  request({
    url: baseURL + `/payment-notice/abolish/${id}`,
    method: "post",
  });
//生成缴费单
export const postPaymentNoticeGeneraWeb = (params,type) =>
  request({
    url: baseURL + `/payment-notice/genera/web`,
    method: "post",
    data: params,
  });

//退费单列表
export const getRefundNotices = (params,type) =>
  request({
    url: baseURL + `/refund-notices`,
    method: "get",
    params,
  });

//退费单详情
export const getRefundNotice = (id,type) =>
  request({
    url: baseURL + `/refund-notice/${id}`,
    method: "get",
  });

//新增退费单
export const postRefundNotice = (params,type) =>
  request({
    url: baseURL + `/refund-notice`,
    method: "post",
    data: params,
  });

//支付退费单
export const postRefundNoticePay = (params,type) =>
  request({
    url: baseURL + `/refund-notice/pay/${params.id}`,
    method: "post",
    data: params,
  });

//作废退费单
export const postRefundNoticeAbolish = (id,type) =>
  request({
    url: baseURL + `/refund-notice/abolish/${id}`,
    method: "post",
  });

//生成退费单
export const postRefundNoticeGeneraWeb = (params,type) =>
  request({
    url: baseURL + `/refund-notice/genera/web`,
    method: "post",
    data: params,
  });

//合同预览
export const postContractLeaseBrowse = (data,type) =>
  request({
    url: baseURL + `/contract-lease/browse/${data.id}`,
    method: "post",
    data,
  });

//合同到期列表
export const getContractLeasesStatistics = (params,type) =>
  request({
    url: baseURL + `/contract-leases/statistics`,
    method: "get",
    params,
  });
