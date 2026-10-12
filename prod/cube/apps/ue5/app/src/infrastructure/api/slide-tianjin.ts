import request from "../service/request";
const baseURL = "/api/sn-meattrade-plugin";
import {
  MeatTradeRankVO,
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
    url: `${baseURL}/dbc/meat-trade/stat/sellers/comparison-top`,
    params,
    method: "GET",
  });
}
/**
 * 三维白条来货数据统计
 */
export function porkBimStatAbattoir<T extends Record<string, any>>(params?: T) {
  return request<WhiteBarDataList>({
    url: `${baseURL}/dbc/meat-trade/stat/farm/supply-ranking`,
    params,
    method: "GET",
  });
}
/**
 * 供货数据信息
 */
export function porkBimStatSupplyData<T extends Record<string, any>>(params?: T) {
  return request<SupplyDataInformationVO>({
    url: `${baseURL}/dbc/meat-trade/stat/sellers/supply-sum`,
    method: "GET",
    params,
  });
}

/**
 * 理货片数统计
 */
export function porkBimSlicesStatistics<T extends Record<string, any>>(params?: T) {
  return request<{ number: number; qoq: number }>({
    url: `/api/meattrade/pork-bim/stat/arrange/slices/statistics`,
    method: "GET",
    params,
  });
}

/**
 * 理货片数统计-设备端
 */
export function porkBimDeviceSlicesStatistics<T extends Record<string, any>>(params?: T) {
  return request<{ id: string; code: string; name: string; number: number }[]>({
    url: `/api/meattrade/pork-bim-stat/device/arrange-slices/statistics`,
    method: "GET",
    params,
  });
}

/**
 * 交易数据汇总
 */
export function porkBimStatSummary<T extends Record<string, any>>(params?: T) {
  return request<SummaryTransactionData>({
    url: `${baseURL}/dbc/meat-trade/stat/transaction-comparison`,
    method: "GET",
    params,
  });
}
/**
 * 食安信息
 */
export function meatTradeRank<T extends Record<string, any>>(params?: T) {
  return request<MeatTradeRankVO[]>({
    url: `${baseURL}/dbc/meat-trade/stat/testing-ranking`,
    method: "GET",
    params: {
      ...params,
    },
  });
}

/**
 * 交易金额详细信息
 */
export function transactionComparisonAmount<T extends Record<string, any>>(params?: T) {
  return request<{
    currentAmount: number;
    currentDateAmountList: {
      summaryDate: string;
      summaryAmount: number;
    }[];
    lastAmount: number;
    lastDateAmountList: {
      summaryDate: string;
      summaryAmount: number;
    }[];
    qoqTradeAmount: number;
  }>({
    url: `${baseURL}/dbc/meat-trade/stat/transaction-comparison/amount`,
    method: "GET",
    params: {
      ...params,
    },
  });
}

/**
 * 交易佣金详细信息
 */
export function transactionComparisonCommission<T extends Record<string, any>>(params?: T) {
  return request<{
    currentCommission: number;
    currentDateCommissionList: {
      summaryDate: string;
      summaryCommission: number;
    }[];
    lastCommission: number;
    lastDateCommissionList: {
      summaryDate: string;
      summaryCommission: number;
    }[];
    qoqTradeCommission: number;
  }>({
    url: `${baseURL}/dbc/meat-trade/stat/transaction-comparison/commission`,
    method: "GET",
    params: {
      ...params,
    },
  });
}

/**
 * 交易佣金详细信息
 */
export function transactionComparisonAverage<T extends Record<string, any>>(params?: T) {
  return request<{
    currentAveragePrice: number;
    currentDateAveragePriceList: {
      summaryDate: string;
      summaryAveragePrice: number;
    }[];
    lastAveragePrice: number;
    lastDateAveragePriceList: {
      summaryDate: string;
      summaryAveragePrice: number;
    }[];
    qoqTradeAveragePrice: number;
  }>({
    url: `${baseURL}/dbc/meat-trade/stat/transaction-comparison/average-price`,
    method: "GET",
    params: {
      ...params,
    },
  });
}

/**
 * 实际均价详细信息
 */
export function transactionComparisonActualAverage<T extends Record<string, any>>(params?: T) {
  return request<{
    currentAveragePrice: number;
    currentDateAveragePriceList: {
      summaryDate: string;
      summaryAveragePrice: number;
    }[];
    lastAveragePrice: number;
    lastDateAveragePriceList: {
      summaryDate: string;
      summaryAveragePrice: number;
    }[];
    qoqTradeAveragePrice: number;
  }>({
    url: `${baseURL}/dbc/meat-trade/stat/transaction-comparison/actual-average-price`,
    method: "GET",
    params: {
      ...params,
    },
  });
}

/**
 * 交易重量详细信息
 */
export function transactionComparisonWeight<T extends Record<string, any>>(params?: T) {
  return request<{
    currentWeight: number;
    currentDateWeightList: {
      summaryDate: string;
      summaryWeight: number;
    }[];
    lastWeight: number;
    lastDateWeightList: {
      summaryDate: string;
      summaryWeight: number;
    }[];
    qoqTradeWeight: number;
  }>({
    url: `${baseURL}/dbc/meat-trade/stat/transaction-comparison/weight`,
    method: "GET",
    params: {
      ...params,
    },
  });
}

/**
 * 交易片数详细信息
 */
export function transactionComparisonSlice<T extends Record<string, any>>(params?: T) {
  return request<{
    currentSlices: number;
    currentDateSlicesList: {
      summaryDate: string;
      summarySlices: number;
    }[];
    lastSlices: number;
    lastDateSlicesList: {
      summaryDate: string;
      summarySlices: number;
    }[];
    qoqTradeSlices: number;
  }>({
    url: `${baseURL}/dbc/meat-trade/stat/transaction-comparison/slice`,
    method: "GET",
    params: {
      ...params,
    },
  });
}

/**
 * 获取检测项详细分页列表
 */
export function meatTradeTestingPage<T extends Record<string, any>>(params?: T) {
  return request<{
    pages: number;
    records: {
      id: string;
      supplierId: string;
      supplierName: string;
      porkReportCode: string;
      checkResult: string;
      inspectorName: string;
    }[];
    total: number;
  }>({
    url: `${baseURL}/dbc/meat-trade/stat/testing/page`,
    method: "GET",
    params: {
      ...params,
    },
  });
}
