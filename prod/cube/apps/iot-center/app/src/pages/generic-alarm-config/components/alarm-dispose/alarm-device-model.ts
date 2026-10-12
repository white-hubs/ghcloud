export interface DeviceTypeAlarm {
  conditionType: string;
  deviceName: string;
  deviceAreaId: string;
  deviceAreaName: string;
  deviceProdCategoryCodeConcat: string | undefined;
  deviceProdCategoryName: string | undefined;
  deviceProdId: string | undefined;
  deviceProdName: string | undefined;
  deviceGenreId?: string;
  deviceGenreName?: string;
  deviceModelId?: string;
  deviceModelName?: string;
  productCategoryName?: string;
  productCategoryPathCode?: string;
  productId?: string;
  productName?: string;
  id: string;
  deviceId: string;
  enabled?: boolean;
}
// deviceGenreId, deviceGenreName, deviceModelId, deviceModelName
export interface AlarmDeviceType {
  enabled: boolean;
  emergencyRuleConditions: DeviceTypeAlarm[];
}

export interface AlarmDeviceRef {
  getValue: () => AlarmDeviceType;
  openModal: () => void;
  handleDelDevice: () => void;
}
export interface EnergyAlarmDeviceType {
  enabled: boolean;
  emergencyRuleConditions: DeviceTypeAlarm[];
}

export interface EnergyAlarmDeviceRef {
  getShowModel: (arg: boolean) => boolean;
}
