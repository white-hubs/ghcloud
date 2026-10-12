export interface PageResult<T> {
  records: T[];
  pages: number;
  total: number;
}
export interface MerchantInfoVo {
  id: string;
  name: string;
  sex: string;
  age: number | string;
  updateTime: number;
  createTime: number;
  createBy: string;
  merchantType: string;
  area: string;
  businessScope: string;
  businessScaleNumber: string;
  vehicleType: string;
  nativePlaceIds: string;
  nativePlace: string;
  upstreamSourceIds: string;
  upstreamSource: string;
  businessScale: string;
}
export interface RegionTreeVo {
  id: number;
  pid: number;
  deep: number;
  name: string;
  pinyinPrefix: string;
  pinyin: string;
  extId: number;
  extName: string;
  childList: RegionTreeVo[];
}
export interface ImportResultVO {
  /**
   * 失败数
   */
  total: number | null;
  /**
   * 成功数
   */
  success: number | null;
  /**
   * 错误数据
   */
  errorList: unknown[] | null;
}
export interface SexList {
  key: string;
  value: string;
}

export interface AgeList {
  key: string;
  value: string;
}

export interface BarChartOneList {
  key: string;
  value: string;
}

export interface BarChartTwoList {
  key: string;
  value: string;
}

export interface PieChartList {
  key: string;
  value: string;
}

export interface Wholesaler {
  total: number;
  sexList: SexList[];
  ageList: AgeList[];
  barChartOneList: BarChartOneList[];
  barChartTwoList: BarChartTwoList[];
  pieChartList: PieChartList[];
}

export interface Purchaser {
  total: number;
  sexList: SexList[];
  ageList: AgeList[];
  barChartOneList: BarChartOneList[];
  barChartTwoList: BarChartTwoList[];
  pieChartList: PieChartList[];
}

export interface MerchantData {
  wholesaler: Wholesaler;
  purchaser: Purchaser;
}

export interface FoodSafeStat {
  id: string | null;
  passCount: number | null;
  passPercent: string | null;
  testCount: number | null;
  timeDay: number | null;
  timeDayFormat: string | null;
}
export interface FoodSafetyTrendStatVo {
  trendX: string;
  trendY: string;
}
