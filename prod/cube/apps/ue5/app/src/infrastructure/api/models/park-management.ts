export interface GetParkingOverview {
  empty: number;
  total: number;
  used: number;
  percentageUsed?: string;
  percentIdle?: string;
}
export interface ParkingSeries {
  name: string;
  total: number;
  value: number[];
}
export interface PaymentType {
  code: string;
  freeAmount: number;
  name: string;
}
export interface TrafficFowTrend {
  ringRatio: number;
  series: ParkingSeries[];
  xdata: string[];
}
export interface ChargingOverviewType {
  discountAmount: number;
  discountAmountRingRatio: number;
  freeAmount: number;
  freeAmountRingRatio: number;
  receivableAmount: number;
  receivableAmountRingRatio: number;
}
