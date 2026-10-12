export interface RecordType {
  id: string;
  name: string;
  areaId: string;
  areaName: string;
  brandName: string;
  code: string;
  departmentId: string;
  departmentName: string;
  genreId: string;
  genreName: string;
  modelId: string;
  modelName: string;
  monitors: [];
  professionName: string;
  securityLocked: boolean;
  status: string;
  statusName: string;
}
export interface DeviceSceneConfig {
  businessId: string;
  businessType: string;
  id: string;
  sceneType: string;
  sceneTypeSequence?: string;
}
export interface Organizationtype {
  children: Organizationtype[];
  id: string;
  level: number;
  name: string;
  parentId: string;
  sequence: string;
}
export interface FundTableData {
  currentAmountTotal: string;
  day: string;
  inAmount: number;
  inAmountTotal: number;
  outAmount: number;
  outAmountTotal: number;
  preAmountTotal: number;
}
