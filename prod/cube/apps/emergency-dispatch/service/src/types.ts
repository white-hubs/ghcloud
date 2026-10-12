/** 通用分页 */
export interface PageResult<T> {
  pages?: number;
  records: T[];
  total: number;
}

/** getSecurityUserDeviceAuthPage 查询参数（参考 security-monitor-migrate） */
export interface SecurityUserDeviceAuthPageQuery {
  pageNumber: number;
  pageSize: number;
  applicationCode: string;
  keyword?: string;
  organizationId?: string;
  deviceId?: string;
}

export interface SecurityUserDeviceAuthOrganization {
  id?: string;
  name?: string;
}

export interface SecurityUserDeviceAuthDevice {
  id?: string;
  deviceId?: string;
  code?: string;
  name?: string;
  deviceName?: string;
  areaName?: string;
  categoryName?: string;
  productCategoryName?: string;
}

export interface SecurityUserDeviceAuthRecord {
  id: string;
  name?: string;
  code?: string;
  deviceId?: string;
  deviceName?: string;
  areaName?: string;
  categoryName?: string;
  productCategoryName?: string;
  organization?: SecurityUserDeviceAuthOrganization;
  devices?: SecurityUserDeviceAuthDevice[];
}

export interface MonitorCameraDevice {
  id: string;
  name: string;
  category: string;
  area: string;
}

export interface AreaPlaneMapFileVO {
  id: number | string;
  name: string;
  suffix?: string;
  path?: string;
  size?: number;
  refCount?: number;
  type?: string;
  businessKey?: number | string;
  endpointPath?: string;
  createTime?: string;
}

export interface AreaPlaneMapVO {
  id: number | string;
  areaId: number | string;
  fileId: number | string;
  gpsLocation?: string;
  file?: AreaPlaneMapFileVO;
}

export interface AreaPlaneMapPayload {
  areaId: string;
  fileId: string;
  gpsLocation?: string;
}

export type EvacuationRoutePriority = "HIGH" | "MEDIUM" | "LOW";

export interface EvacuationRouteVO {
  id: string | number;
  routeName: string;
  areaId: string | number;
  capacity: number;
  priority: EvacuationRoutePriority;
  priorityName?: string;
  nodeCount?: number;
  boundDeviceCount?: number;
  pathConfigJson?: string;
  enabled?: boolean;
  deviceIds?: string[];
}

export interface EvacuationRoutePageQuery {
  pageNumber?: number;
  pageSize?: number;
  areaId?: string;
}

export interface EvacuationRouteCreatePayload {
  routeName: string;
  areaId: string;
  capacity: number;
  priority: EvacuationRoutePriority;
  pathConfigJson?: string;
  nodeCount?: number;
  enabled?: boolean;
}

export interface EvacuationRouteUpdatePayload {
  routeName: string;
  capacity: number;
  priority: EvacuationRoutePriority;
  pathConfigJson?: string;
  nodeCount?: number;
  enabled?: boolean;
}

export interface EvacuationRouteDevicesPayload {
  deviceIds: string[];
}
