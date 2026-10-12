// 白条交易大户列表
export interface TransactionList {
  pages: number;
  records: Transaction[];
  total: number;
}
// 白条交易大户
export interface Transaction {
  /**
   * 实际均价
   */
  actualAverageAmount: number;
  /**
   * 环比
   */
  qoq: string;
  /**
   * 实际均价环比
   */
  qoqActualAverageAmount: number;
  /**
   * 交易金额环比
   */
  qoqTradeAmount: number;
  /**
   * 交易均价环比
   */
  qoqTradeAverageAmount: number;
  /**
   * 交易佣金环比
   */
  qoqTradeCommission: number;
  /**
   * 交易片数环比
   */
  qoqTradeSlices: number;
  /**
   * 交易重量环比
   */
  qoqTradeWeight: number;
  /**
   * 排名
   */
  sort: number;
  /**
   * 供货商编号
   */
  supplierCode: string;
  /**
   * 批发商主键
   */
  supplierId: string;
  /**
   * 供货商名称
   */
  supplyName: string;
  /**
   * 交易金额
   */
  tradeAmount: number;
  /**
   * 交易均价
   */
  tradeAverageAmount: number;
  /**
   * 交易佣金
   */
  tradeCommission: number;
  /**
   * 交易片数
   */
  tradeSlices: number;
  /**
   * 交易重量
   */
  tradeWeight: number;
}
// 三维白条来货数据统计
export interface WhiteBarDataList {
  pages: number;
  records: WhiteBarData[];
  total: number;
}
export interface WhiteBarData {
  /**
   * 屠宰场名称
   */
  abattoirName: string;
  /**
   * 环比
   */
  qoq: string;
  /**
   * 供货片数
   */
  supplySlices: number;
  /**
   * 供货重量
   */
  supplyWeight: number;
}
// 交易数据汇总
export interface SummaryTransactionData {
  /**
   * 实际均价
   */
  actualAverageAmount: number;
  /**
   * 实际均价环比
   */
  qoqActualAverageAmount: number;
  /**
   * 交易金额环比
   */
  qoqTradeAmount: number;
  /**
   * 交易均价环比
   */
  qoqTradeAverageAmount: number;
  /**
   * 交易佣金环比
   */
  qoqTradeCommission: number;
  /**
   * 交易片数环比
   */
  qoqTradeSlices: number;
  /**
   * 交易重量环比
   */
  qoqTradeWeight: number;
  /**
   * 交易金额
   */
  tradeAmount: number;
  /**
   * 交易均价
   */
  tradeAverageAmount: number;
  /**
   * 交易佣金
   */
  tradeCommission: number;
  /**
   * 交易片数
   */
  tradeSlices: number;
  /**
   * 交易重量
   */
  tradeWeight: number;
}
// 供货数据信息
export interface SupplyDataInformationVO {
  /**
   * 供货商数量环比
   */
  qoqSupplier: number;
  /**
   * 供货片数环比
   */
  qoqSupplySlices: number;
  /**
   * 交易重量环比
   */
  qoqSupplyWeight: number;
  /**
   * 供货商数量
   */
  supplier: number;
  /**
   * 供货片数
   */
  supplySlices: number;
  /**
   * 交易重量
   */
  supplyWeight: number;
}
//食安信息
export interface SpotCheckVO  {
  supplyReports: number,
  pratiqueFailed: number,
  pratiqueFailedPer: number,
  qoqPratiqueFailed: number,
  clenbuterolFailed: number,
  clenbuterolFailedPer: number,
  qoqClenbuterolFailed: number,
  watered: number,
  wateredPer: number,
  qoqWatered: number
}

export interface MeatTradeRankVO  {
  id: string,
  timeRange: string,
  startDate: string,
  endDate: string,
  meatTestingItem: string,
  meatTestingItemCode: string,
  meatTestingItemName: string,
  totalCheckNumSum: number,
  totalSum: number,
  notPassSum: number,
  prevTotalCheckNumSum: number,
  prevTotalSum: number,
  prevNotPassSum: number,
  checkNumSumRate: number,
  totalSumRate: number,
  notPassSumRate: number,
}

// 交易重量列表
export interface ResTransactionWeightListponse {
  /**
   * 本期数据
   */
  currentDateWeightList: CurrentDateWeightList[];
  /**
   * 本期重量
   */
  currentWeight: number;
  /**
   * 上期数据
   */
  lastDateWeightList: LastDateWeightList[];
  /**
   * 上期重量
   */
  lastWeight: number;
  /**
   * 环比值
   */
  qoqTradeWeight: number;
}

export interface CurrentDateWeightList {
  /**
   * 交易时间
   */
  summaryDate: string;
  /**
   * 交易重量
   */
  summaryWeight: string;
}

export interface LastDateWeightList {
  /**
   * 交易时间
   */
  summaryDate: string;
  /**
   * 交易重量
   */
  summaryWeight: string;
}

export interface  MachinePanelInformation {
  /**
   * 理货信息
   */
  porkArrange: PorkArrange;
  /**
   * 理货审核状态
   */
  porkArrangeAuditStatus: string;
  /**
   * 当前理货详细数据
   */
  porkArrangeDetail: PorkArrangeDetail;
  /**
   * 理货状态
   */
  porkArrangeStatus: string;
  /**
   * 报备信息
   */
  porkReport: PorkReport;
  /**
   * 报备情况
   */
  porkReportStatAudit: PorkReportStatAudit;
  /**
   * 理货情况
   */
  porkStatArrangeAudit: PorkStatArrangeAudit;
  /**
   * 商户信息
   */
  supplierInfo: SupplierInfo;
}

/**
* 理货信息
*/
export interface PorkArrange {
  /**
   * 总片数
   */
  porkReportSlices: number;
  /**
   * 理货重量
   */
  porkReportWeight: number;
  /**
   * 理货片数
   */
  slices: number;
  /**
   * 理货重量
   */
  weight: number;
}

/**
* 理货审核状态
*/
export enum PorkArrangeAuditStatus {
  AUDIT = "审核中",
  FAILED = "失败",
  PASSED = "通过",
}

/**
* 当前理货详细数据
*/
export interface PorkArrangeDetail {
  /**
   * 脚标编码
   */
  footMarkCode: string;
  /**
   * 商品品类
   */
  goodsCategoryId: string;
  /**
   * 商品品类名称
   */
  goodsCategoryName: string;
  /**
   * 主键
   */
  id: string;
  /**
   * 电子标签
   */
  label: string;
  /**
   * 图片文件地址
   */
  picFilePaths: string[];
  /**
   * 理货时间
   */
  porkArrangeTime: string;
  /**
   * 报备号
   */
  porkReportCode: string;
  /**
   * 批发商主键
   */
  supplierId: string;
  /**
   * 净重
   */
  weight: number;
  picPaths:string;
}

/**
* 理货状态
*/
export enum PorkArrangeStatus {
  FINISHED = "完成理货",
  PAUSED = "暂停理货",
  PROGRESSED = "正在理货",
  UNKNOWN = "理货未知",
  WAITED = "待理货",
}

/**
* 报备信息
*/
export interface PorkReport {
  pratiqueCode:string;
  /**
   * 屠宰场编号
   */
  abattoirCode: string;
  /**
   * 屠宰场主键
   */
  abattoirId: string;
  /**
   * 屠宰场名称
   */
  abattoirName: string;
  /**
   * 到达时间
   */
  arrivedTime: string;
  code: string;
  /**
   * 检疫证号图片集合
   */
  files: { [key: string]: any }[];
  /**
   * 报备商品名称
   */
  goodsCategoryName: string;
  id: string;
  /**
   * 检疫证号
   */
  pratiqueCodes: string[];
  /**
   * 报备片数
   */
  reportSlices: number;
  /**
   * 报备时间
   */
  reportTime: string;
  /**
   * 报备重量
   */
  reportWeight: number;
  /**
   * 车辆号码
   */
  vehiclePlate: string;
}

/**
* 报备情况
*/
export interface PorkReportStatAudit {
  /**
   * 报备不合格数
   */
  porkReportAuditFailedNum: number;
  /**
   * 报备合格数
   */
  porkReportAuditPassedNum: number;
  /**
   * 报备数据审核总数
   */
  total: number;
}

/**
* 理货情况
*/
export interface PorkStatArrangeAudit {
  /**
   * 理货不合格数
   */
  porkArrangeAuditFailedNum: number;
  /**
   * 理货合格数
   */
  porkArrangeAuditPassedNum: number;
  /**
   * 理货数据审核总数
   */
  total: number;
}

/**
* 商户信息
*/
export interface SupplierInfo {
  /**
   * 详细地址
   */
  address: string;
  /**
   * 所属地区
   */
  area: string;
  /**
   * 商家编号
   */
  code: string;
  /**
   * 头像文件信息
   */
  fileVO: string;
  /**
   * 主键
   */
  id: string;
  /**
   * 联系人
   */
  liaison: string;
  /**
   * 商家名称
   */
  name: string;
  /**
   * 联系人手机号
   */
  phone: string;
}