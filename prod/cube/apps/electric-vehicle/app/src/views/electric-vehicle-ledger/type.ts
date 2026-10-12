import type { FileType } from '@ghcloud/cube-ui'

export interface FileTypes extends FileType {
  readonly id: string;
}
export interface LegerType {
  electronMobileColour: string | undefined;
  brand: string | undefined;
  serialNumber: string | undefined;
  plateNumber: string | undefined;
  receiveUserType: string | undefined;
  typeName?: string | undefined;
  electronMobileType: string | undefined;
  stallId: string | undefined;
  attribute: string | undefined;
  maintenanceDepId: string | undefined;
  maintenanceUserId: string | undefined;
  receiveUserName: string | undefined;
  name: string | undefined;
  areaId: string[];
  sitePointId: string | undefined;
  receiveDepId: string | undefined;
  receiveUserPhone: string | undefined;
  files: FileTypes[] | undefined;
  norms: string | undefined;
}
export const CarType = new Map([
  ['BICYCLE', '电动单车'],
  ['TRICYCLE', '电动三轮车'],
  ['FOUR_WHEELED', '电动四轮车'],
])
export const UserType = new Map([
  ['MERCHANT', '商户'],
  ['MARKET', '市场人员'],
])
