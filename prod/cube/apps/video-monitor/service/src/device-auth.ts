import { makeListRequest, Pagination, PaginationQuery } from '@ghcloud/cube-gateway'

export interface ListDeviceAuthParams {
  keyword?: string;
}

export enum DeviceAuthScopeType { 
  /**
     * 设备区域
     */
  DEVICE_AREA = 'DEVICE_AREA',

  /**
   * 设备分组
   */
  DEVICE_GROUP = 'DEVICE_GROUP',

  /**
   * 设备
   */
  DEVICE = 'DEVICE',
}

export interface DeviceAuthScope {
  scopeType: DeviceAuthScopeType;
  scopeName: string;
  scopeId: string;
  authGroupId: string;
}

export enum DeviceAuthGrantTargetType {

  DEPARTMENT = 'DEPARTMENT',

  ROLE = 'ROLE',

  USER = 'USER',
}

export interface DeviceAuthGrantTarget {
  targetType: DeviceAuthGrantTargetType;
  targetIds: string[];
  authGroupId: string;
}

export interface DeviceAuth {
  id: string;
  authScopes: DeviceAuthScope[];
  deviceCount: number;
  grantTargets: DeviceAuthGrantTarget[];
}

export const listDeviceAuth = async (params: PaginationQuery<ListDeviceAuthParams>): Promise<Pagination<DeviceAuth>> => {
  const resp = await makeListRequest({
    url: '/api/vmonitor/camera-auths',
    payload: {
      ...params,
    },
  }).send()
  return resp.json<Pagination<DeviceAuth>>()
}
