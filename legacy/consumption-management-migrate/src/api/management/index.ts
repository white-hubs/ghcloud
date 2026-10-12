import { request, service } from "@/service/index";

let baseUrl = "onecard";
enum URL {
  /**账户管理分页列表 */
  GetAccountInfo = `/accountInfo`,
  /**详情 */
  GetAccountDetails = `/account-details/`,
  /**金额变更明细 */
  GetAmountChange = "/amount-change-record",
  /**份变更明细 */
  GetCopiesChange = "/copies-change-record",
  /**状态 */
  AccountStatus = "/account-status",
  TransactionType = "/transaction-type",
  RecordType = "/record-type",
  /**
   * 按消费类型统计变更金额

   */
  GetAmountChangeClassification = "/amount-change-classification",
  GetShareStatistics = "/share-statistics",
  /**金额导出 */
  MoneyExport = "/amount-record-excel",
  /**份导出 */
  CopiesExport = "/copies-record-excel",
}
/**
 * 获取账户管理分页列表

 * @returns
 */
export const GetAccountInfo = (
  params: AccountManagement.AccountManagementData,
) => {
  return request.get(baseUrl + URL.GetAccountInfo, {
    params,
  });
};
/**
 * 获取账户管理详情

 * @returns
 */
export const GetAccountDetails = (id: string) => {
  return request.get(baseUrl + URL.GetAccountDetails + id, {});
};
/**
 * 获取账金额变更明细

 * @returns
 */
export const GetAmountChange = (params: MoneyChange.MoneyChangeData) => {
  return request.get(baseUrl + URL.GetAmountChange, {
    params,
  });
};
/**
 * 获取份变更明细

 * @returns
 */
export const GetCopiesChange = (params: PartChange.PartChangeData) => {
  return request.get(baseUrl + URL.GetCopiesChange, {
    params,
  });
};
/**
 * 账户状态下拉框
 * @returns
 */
export const AccountStatus = () => {
  return request.get(baseUrl + URL.AccountStatus, {});
};
// 交易类型下拉框

export const TransactionType = () => {
  return request.get(baseUrl + URL.TransactionType, {});
};
export const RecordType = () => {
  return request.get(baseUrl + '/consume-record-out/record-type', {});
};
// 按消费类型统计变更金额

export const GetAmountChangeClassification = (params: {
  enterParam: string;
  period: string;
}) => {
  return request.get(baseUrl + URL.GetAmountChangeClassification, { params });
};
//按份统计相关变更记录
export const GetShareStatistics = (params: {
  enterParam: string;
  period: string;
}) => {
  return request.get(baseUrl + URL.GetShareStatistics, { params });
};
// 查询消费记录
export const getConsumeRecordPage = (params: {
  interfaceEnum?: string;
  accountId?: string;
  period?: string;
  pageNumber: number;
  pageSize: number;
}) => {
  return request.get(baseUrl + '/consume-record-out/page', {
    params,
  });
};
// 获取指定员工的账户信息
export const getConsumeAccountInfo = (params: {
  id: string | number;
}) => {
  return request.get(baseUrl + `/account-info/${params?.id}`, {
    params,
  });
};

export const MoneyExport = (params: {
  transactionType: string;
  enterParam: string;
  period: string;
}) => {
  return service.get("/api" + baseUrl + URL.MoneyExport, {
    params,
  });
};

//按份统计相关变更记录

export const CopiesExport = (params: {
  transactionType: string;
  enterParam: string;
  period: string;
}) => {
  return service.get("/api" + baseUrl + URL.CopiesExport, {
    params,
  });
};
