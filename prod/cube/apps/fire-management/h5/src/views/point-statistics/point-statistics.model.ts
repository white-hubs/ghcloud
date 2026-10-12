export interface PointStatisticsRecord {
  id: string;
  pointName: string;
  location: string;
  alarmCount: number;
  faultCount: number;
  totalCount: number;
  lastTriggered: string;
}

export interface PointStatisticsFilters {
  hostId: string;
  location: string;
  startDate: string;
  endDate: string;
}

export const DEFAULT_POINT_STATISTICS_FILTERS: PointStatisticsFilters = {
  hostId: "",
  location: "",
  startDate: "",
  endDate: "",
};
