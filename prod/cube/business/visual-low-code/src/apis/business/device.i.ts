interface DetailType {
  areaId: string;
  areaIdList: string[];
  areaName: string;
  brandId: string;
  brandName: string;
  code: string;
  communicationStatus: string;
  createTime: number;
  credited: string | null;
  dailyWorkTime: number;
  departmentId: string;
  departmentIdList: string[];
  departmentName: string;
  deviceStatus: string;
  expandInfo: string;
  faultThreshold: number;
  genreCode: string;
  genreId: string;
  genreName: string;
  hiddenDangerThreshold: number;
  id: string;
  identify: string;
  images: object[];
  installDate: string | null;
  installPhone: string;
  installUnit: string;
  lntAndLat: string;
  manager: string[];
  managerJson: string;
  managerUserName: string[];
  modelId: string;
  modelName: string;
  monitorIds: [];
  name: string;
  purchaseDate: string;
  purchasePrice: string;
  singleAreaId: string;
  thirdPartyCode: string;
  usefulLife: number;
}
export interface DeviceInfoType {
  detail: DetailType;
  deviceAttributes: DeviceAttributesType[];
}

export interface DeviceAttributesType {
  attributeCode: string;
  attributeId: string;
  attributeKeyValueVos: [];
  attributeName: string;
  attributeTypeId: string | null;
  attributeTypeName: string;
  attributeUnitId: string | null;
  attributeUnitName: string;
  dataType: string;
  permission: string;
  valueMax: string;
  valueMin: string;
}
export interface MediaConfigType {
  ipAddress: string;
  intranetAddress: string;
  identify: string;
}
export interface IotConfigType {
  steamMediaIpAddress: string;
  steamMediaIntranetAddress: string;
  identify: string;
}
export interface CameraType {
  steamMediaIpAddress: string; steamMediaIntranetAddress: string; token: string;
}
