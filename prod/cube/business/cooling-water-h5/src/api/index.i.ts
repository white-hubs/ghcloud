export interface BasicState {
  frontController: number;
  gearPosition: number;
  wholesaler: number;
}
export interface ActivityState {
  numberOfActive: number;
  rateMerchantsQoq: number;
  rateMerchantsYoy: number;
  deviceNum: number;
  rateDeviceQoq: number;
  rateDeviceYoy: number;
  barSeries?: unknown[];
  yAxisOption: unknown[];
  numberOfActiveMerchantsList: { keyName: string; value: number; }[];
  xTitle: string[];
  numberOfActiveDeviceList: { keyName: string; value: number; }[];
}
export interface CoolWaterUsedState {
  costTotal: number; // 累计费用
  costRateQoq: number; // 费用环比
  costRateYoy: number;// 费用同比
  duration: number; // 累计运行时长
  durationRateQoq: number; // 时长环比
  durationRateYoy: number;// 时长同比
  flow: number; // 冷媒累计使用流量
  flowRateQoq: number; // 环比
  flowRateYoy: number;// 同比
  numberOfActiveMerchantsList: { keyName: string; value: number; }[];
  xTitle: string[];
  numberOfActiveDeviceList: { keyName: string; value: number; }[];
}
