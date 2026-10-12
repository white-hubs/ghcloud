import type { DeviceTagDetail } from '@ghcloud/cube-iot-center-service'

export interface PictureState {
  id: string;
  name: string;
  path: string;
}

export interface DeviceLedgerState {
  deviceName: string;
  deviceCode: string;
  deviceBizType: string;
  departmentName: string;
  areaName: string;
  maintenanceCast: string;
  deviceState: string | number;
  id: string;
}

/** 设备状态 */
export const DeviceStatusOptions = [
  { label: '离线', value: 0, color: 'default' },
  { label: '在线', value: 1, color: 'success' },
]

/** 控制器状态 */
export enum CtlStatus {
  OFFLINE = 0,
  ONLINE = 1,
}
export const CtlStatusOptions = [
  { label: '离线', value: CtlStatus.OFFLINE, color: 'warn' },
  { label: '在线', value: CtlStatus.ONLINE, color: 'sucess' },
]

/** 工作状态 */
export enum StatusE {
  UNACTIVATED = -1,
  OFFLINE = 0,
  ONLINE = 1,
}
export const statusOptions = [
  { label: '未激活', value: 0, color: 'processing' },
  { label: '离线', value: 2, color: 'default' },
  { label: '在线', value: 1, color: 'success' },
  { label: '已禁用', value: 3, color: 'error' },
]
export const onlineStateOptions = [
  { label: '离线', value: false, color: 'default' },
  { label: '在线', value: true, color: 'success' },
]

/** 链接状态 */
export enum LinkStatusE {
  STOPPED = 0,
  STARTING = 1,
  RUNNING = 2,
  STOPPING = 3,
  ABNORMAL = 4,
}
export const LinkStatusOptions = [
  { label: '停止', value: LinkStatusE.STOPPED, color: 'warn' },
  { label: '启动中', value: LinkStatusE.STARTING, color: 'info' },
  { label: '运行中', value: LinkStatusE.RUNNING, color: 'sucess' },
  { label: '停止中', value: LinkStatusE.STOPPING, color: 'info' },
  { label: '异常', value: LinkStatusE.ABNORMAL, color: 'error' },
]

export interface LedgerInfo {
  [key: string]: unknown;
  baseArchivesInfo?: BaseArchivesInfo;
  expandInfo?: ExpandInfoType;
  productInfo?: ProductInfoType;
  deviceTagList?: DeviceTagDetail[];
}

export interface BaseArchivesInfo {
  area: Area;
  code: string;
  department: Department;
  manager: Manager[];
  id: number;
  managerIds: string[];
  managerNames: string;
  name: string;
  picture?: { id: string; }[];
  picturePath?: string;
  status: DeviceStatus;
  thirdpartyCfg?: string;
  thirdPartyId?: string;
}

export interface Area {
  id: string;
  name: string;
  pathId: string;
}

export interface Department {
  id: string;
  name: string;
}

export interface Manager {
  id: string;
  name: string;
}

export interface DeviceStatus {
  communicationTime: string;
  onlineState: boolean;
}

export interface ExpandInfoType {
  factoryInfo: FactoryInfoType;
  id: string;
  lntAndLat: string;
  locationDes: string;
  purchaseInfo: PurchaseInfo;
  spatialCoordinates: string;
}

export interface FactoryInfoType {
  productionDate?: string;
  usefulLife: number;
}
export interface PurchaseInfo {
  purchaseDate: string;
  unitPrice: number;
}

export interface ProductInfoType {
  brandName: string;
  icon: number;
  id: string;
  modelName: string;
  name: string;
  picture: number;
  productCategory: ProductCategory;
}

export interface ProductCategory {
  code: string;
  id: string;
  name: string;
}
export interface DeviceInfo {
  name: string;
  deviceNumber: string;
  statusName: string;
  status: number;
  onlineTime: number;
  onlineTimeStr: string;
  product: {
    id: string;
  };
  slaveDeviceIds: string;
}
