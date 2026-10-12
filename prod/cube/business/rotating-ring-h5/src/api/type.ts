declare namespace ApiType {
  enum DeviceState {
    '离线' = 0,
    '在线' = 1
  }
  interface DeviceInfo {
    modelName: string;
    name: string;
    productCategory: {
      name: string;
    };
    brandName: string;
    deviceState: number;
    iotDeviceNumberCode: string;
    areaName: string;
    fileVO: {
      path: string;
    };
  }

}
