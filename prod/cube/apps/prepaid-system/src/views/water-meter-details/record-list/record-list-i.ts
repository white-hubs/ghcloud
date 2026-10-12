export interface SearchType {
  pageNumber: number;
  pageSize: number;
}
export interface TableData {
  name: string;
  id: string;
  code: string;
  areaName: string;
}
export const BuyType = new Map([
  [1, '现金缴费'],
  [2, '刷卡机缴费'],
  [3, '微信扫码支付'],
  [4, '支付宝扫码支付'],
  [5, '公对公转账'],
  [6, '冲正或退水'],
  [7, '微信支付'],
  [8, '支付宝支付'],
  [9, '容量费'],
  [10, '充值批量导入'],
  [11, '网银转账'],
  [12, '公摊水费'],
  [13, '基础水费'],
  [20, '在线卡充值'],
  [14, '水费退补'],
])
export const SaleType = new Map([
  [1, '正常售水'],
  [2, '冲正'],
  [3, '退水'],
  [4, '初始化'],
  [5, '容量费'],
])
