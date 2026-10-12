export interface EventVideo {
  id: string;
  eventId: string;
  deviceId: string;
  deviceCode: string;
  deviceName: string;
  token: string;
  type: string;
}

export interface DataConstraint {
  label: string;
  value: string;
}

export interface ProductPropVoList {
  propCode: string;
  propName: string;
  dataType: string;
  precision: number;
  unitName: string;
  dataWrite: number;
  dataConstraint: DataConstraint[];
  isTelemetry?: any;
  remark: string;
}

export interface Snapshot {
  key: string;
  preValue: string;
  changed: boolean;
  ts: number;
}

export interface GetNorthDeviceDetailSn {
  deviceId: string;
  deviceParentId: string;
  deviceNumber: string;
  productId: string;
  productName: string;
  deviceName: string;
  onlineState: number;
  tags: string;
  productPropVoList: ProductPropVoList[];
  productEventVoList: any[];
  snapshots: Snapshot[];
  productCommandVoList: any[];
  extConfig?: any;
  preValue: string;
}
