export interface UtilizationRate {
  useArea: number;
  total: number;
  utilizationRate: number;
}
export interface StatisticsEnterprises {
  industryStatisticsEnterprises: IndustryStatisticsEnterpris[];
  total: number;
}

export interface IndustryStatisticsEnterpris {
  /**
   * 行业
   */
  industry: string;
  /**
   * 数量
   */
  num: number;
  /**
   * 占比
   */
  rate: string;
}

export interface RentalTrend {
  timeFlag: string;
  num: number;
}

export interface RentalTrends {
  xtitle: string[];
  rentalTrends: RentalTrend[];
}

export interface ParkFloors {
  areaName: string;
  areaId: string;
  rentedArea: number;
  rentedAreaRate: number;
  unleasedAreaRate: number;
  total: number;
}
