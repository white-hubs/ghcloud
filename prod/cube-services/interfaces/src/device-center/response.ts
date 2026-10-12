import type { StringLike } from "bun";

export interface DeviceInstance {
  id: string;
  name: string;
  code: string;
  thirdPartyId: string;
  //...其他设备信息
  areaName?: string;
  area?: {
    pathName?: string;
    id?: string;
    name?: string;
  };
}

export interface DeviceInstancePageResult {
  records: DeviceInstance[];
  total: number;
  pages: number;
}

/** `GET /device/mgt/page` 返回的分页设备项。 */
export interface DeviceManagementPageItem {
  id: string | number;
  deviceNumber: string;
  name: string;
  productId: string | number;
  productName?: string;
  status?: number;
  statusName?: string;
  deviceType?: number;
  deviceTypeName?: string;
}

/** 设备中心产品下拉项。 */
export interface DeviceProductOption {
  id: string | number;
  prodName: string;
}

/** 设备中心产品品牌字典项。 */
export interface ProductBrandRecord {
  id: string | number;
  dictId?: string;
  itemCode?: string;
  itemLabel: string;
  itemKey?: string;
  itemValue?: string;
  itemSort?: number;
  status?: number;
  remark?: string;
}

export interface DeviceTagRule {
  id: string;
  // JsonString
  rule: string;
  tagCode: string;
}

export interface DeviceGroup {
  id: string;
  name: string;
  remark: string;
}

export interface DeviceGroupDetail extends DeviceGroup {
  deviceCount: number;
  devices: DeviceInstance[];
}
