import type { Key } from "react";

export interface AlarmIotModel {
  enabled: boolean;
  actionType: "IOT_DEVICE_ACTION";
  id: Key;
  actionConfig: AlarmIotType[];
}
export interface AlarmIotType {
  deviceProdCategoryCode: string;
  deviceProdId: string | undefined;
  uuid: string;
  code: string;
  executeMode: string;
  genreId: string;
  id: Key;
  modelId: string | null;
  name: string;
  propCode: string | null;
  propName: string;
  propValue: string;
}

export interface AlarmIotRef {
  getValue: () => Promise<AlarmIotModel>;
  changeEnabled: (enabled: boolean) => void;
}
