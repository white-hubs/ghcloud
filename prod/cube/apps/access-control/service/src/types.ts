export interface PageResult<T> {
  records: T[];
  pages: number;
  total: number;
}
export interface DoorTypeVo {
  deleted: boolean;
  createBy: string;
  createTime: number;
  updateBy: string;
  updateTime?: number;
  tenant: number;
  id: number;
  doorTypeName: string;
}
export interface DoorDeviceVo {
  id: string;
  name: string;
  doorCode: string;
  typeName: string;
  doorModelName: string;
  areaName: string;
  status: string;
  outBusinessId: string;
  businessId: string;
}
