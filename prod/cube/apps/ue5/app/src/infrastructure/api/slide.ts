import request from "../service/request";
const baseURL = "/api/meattrade";
import {
  SpotCheckVO,
  SummaryTransactionData,
  TransactionList,
  WhiteBarDataList,
  SupplyDataInformationVO,
  ResTransactionWeightListponse,
  MachinePanelInformation,
} from "./models/slide";
/**
 * 三维白条交易大户
 */
export function supplTradeRank<T extends Record<string, any>>(params?: T) {
  return request<TransactionList>({
    url: `${baseURL}/pork-bim-stat/supply-trade/rank`,
    params,
    method: "GET",
  });
}
/**
 * 三维白条来货数据统计
 */
export function porkBimStatAbattoir<T extends Record<string, any>>(params?: T) {
  return request<WhiteBarDataList>({
    url: `${baseURL}/pork-bim-stat/abattoir`,
    params,
    method: "GET",
  });
}
/**
 * 供货数据信息
 */
export function porkBimStatSupplyData<T extends Record<string, any>>(params?: T) {
  return request<SupplyDataInformationVO>({
    url: `${baseURL}/pork-bim-stat/supply-data`,
    method: "GET",
    params,
  });
}
/**
 * 交易数据汇总
 */
export function porkBimStatSummary<T extends Record<string, any>>(params?: T) {
  return request<SummaryTransactionData>({
    url: `${baseURL}/pork-bim-stat/summary`,
    method: "GET",
    params,
  });
}
/**
 * 食安信息
 */
export function spotCheck<T extends Record<string, any>>(params?: T) {
  return request<SpotCheckVO>({
    url: `${baseURL}/pork-bim-stat/spot-check`,
    method: "GET",
    params: {
      ...params,
    },
  });
}
/**
 *
 *批次作弊嫌疑率
 */
export function suspicion<T extends Record<string, any>>(params?: T) {
  return request<{
    total: number;
    suspicion: number;
    qoqSuspicion: number;
    suspicionNum: number;
    noDoubt: number;
    noDoubtNum: number;
    qoqNoDoubt: number;
  }>({
    url: `${baseURL}/pork-bim-stat/suspicion`,
    method: "GET",
    params: {
      ...params,
    },
  });
}

/**
 * 交易数据汇总
 *
 */
export function summary<T extends Record<string, any>>(params?: T) {
  return request<{
    tradeAmount: number;
    qoqTradeAmount: number;
    tradeCommission: number;
    qoqTradeCommission: number;
    tradeAverageAmount: number;
    qoqTradeAverageAmount: number;
    actualAverageAmount: number;
    qoqActualAverageAmount: number;
    tradeWeight: number;
    qoqTradeWeight: number;
    tradeSlices: number;
    qoqTradeSlices: number;
  }>({
    url: `${baseURL}/pork-bim-stat/summary`,
    method: "GET",
    params: {
      ...params,
    },
  });
}
/**
 * 供货数据信息
 */
export function supplydata<T extends Record<string, any>>(params?: T) {
  return request<{
    supplier: number;
    qoqSupplier: number;
    supplyWeight: number;
    qoqSupplyWeight: number;
    supplySlices: number;
    qoqSupplySlices: number;
  }>({
    url: `${baseURL}/pork-bim-stat/supply-data`,
    method: "GET",
    params: {
      ...params,
    },
  });
}
/**
 *
 * 理货
 * @returns
 */
export function arrangedata<T extends Record<string, any>>(params?: T) {
  return request<{
    total: number;
    porkArrangeAuditPassed: number;
    qoqPorkArrangeAuditPassed: number;
    porkArrangeAuditPassedNum: number;
    porkArrangeAuditFailed: number;
    qoqPorkArrangeAuditFailed: number;
    porkArrangeAuditFailedNum: number;
  }>({
    url: `${baseURL}/pork-bim-stat/arrange-audit`,
    method: "GET",
    params: {
      ...params,
    },
  });
}
/**
 * 三维登记检疫票分页信息
 *
 */

export function pratiqueregister<T extends Record<string, any>>(params?: T) {
  return request<{
    total: number;
    pages: number;
    records: any;
  }>({
    url: `${baseURL}/pork-bim-stat/pratique-register/page`,
    method: "GET",
    params: {
      ...params,
    },
  });
}
export function statdate<T extends Record<string, any>>(params?: T) {
  return request<any>({
    url: `${baseURL}/pork-bim-stat/date`,
    method: "GET",
    params: {
      ...params,
    },
  });
}

/**
 * 交易重量列表
 */
export function summaryWeightList<T extends Record<string, any>>(params?: T) {
  return request<ResTransactionWeightListponse>({
    url: `${baseURL}/pork-bim-stat/summary-weight/list`,
    method: "GET",
    params,
  });
}
/**
 * 理货机面板信息
 */
export function arrangeLastInfo<T extends Record<string, any>>(deviceId: string) {
  return request<MachinePanelInformation>({
    url: `${baseURL}/pork-bim-stat/device/arrange-last-info/${deviceId}`,
    method: "GET",
  });
}
