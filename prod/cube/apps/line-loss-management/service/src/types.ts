/** 通用分页 */
export interface PageResult<T> {
  pages: number;
  records: T[];
  total: number;
}

export interface LineLossDevicePage {
  deviceCode: string;
  deviceName: string;
  lastCollectTime: string;
  lastReadValue: string;
  currentCollectTime: string;
  readValue: string;
  useValue: string;
  operation: string;
}
export interface LineLossPage {
  lineId: string;
  lineName: string;
  fromNodeName: string;
  toNodeName: string;
  fromNodeLocation: string;
  toNodeLocation: string;
  inputEnergy: string;
  outputEnergy: string;
  lossEnergy: string;
  lossRate: string;
}
export interface OrUpdateDetail {
  id: string;
  periodType: string;
  days: string;
  hourTime: string;
  lastExecuteTime: string;
  remark: string;
  createTime: string;
  createBy: string;
}
