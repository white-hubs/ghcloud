export interface DeviceType {

  id: string;
  name: string;
}
export interface DeviceModel {

  iotDeviceProductId: string;
  iotDeviceProductName: string;
}

export interface ProductParamModel {
  name: string;
  param_code: string;
  data_type: string;
  description: string;
  required: boolean;
  precision: number;
  unit_symbol: string;
  data_config: {
    type: string;
    enumValues: { value: string; label: string }[];
    len: number;
    min: number;
    max: number;
    step: number;
    pattern: string;
  };
}

export interface DeviceProductPropVoList {
  productEventVoList: {
    eventName: string;
    eventCode: string;
    eventConfig: {
      triggerType: string;
      params: ProductParamModel[];
    };
  }[];
  productPropVoList: {
    propCode: string;
    propName: string;
    dataWrite: number;
  }[];

}

export interface ApplicationDevice {
  code: string;
  genreId: string;
  genreName: string;
  modelId: string;
  deviceName: string;
  brandName: string;
  modelName: string;
  deviceId: string;
  areaId: string;
  id: string;
  areaName: string;
  deviceProdCategoryCodeConcat?: string;
  deviceProdCategoryName?: string;
  deviceProdId?: string;
  deviceProdName?: string;
  deviceAreaName: string;
  deviceType: string;
  productName: string;
}

export interface PageResult<T> {
  pages: number;
  total: number;
  records: T[];
}
export interface DeviceInstance {
  areaName: string;
  deviceCode: string;
  deviceName: string;
  iotDeviceBrandName: string;
  iotDeviceBrandCode: string;
  iotDeviceProductName: string;
  deviceBizTypeId: string;
  iotDeviceProductId: string;
}
