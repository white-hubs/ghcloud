import { FireDeviceStatus, FireDeviceType } from "@ghcloud/cube-service-interface/fire-management";

export const TYPE_LABEL: Record<FireDeviceType, string> = {
  [FireDeviceType.Extinguisher]: "灭火器",
  [FireDeviceType.Hydrant]: "消火栓",
  [FireDeviceType.Alarm]: "报警按钮",
  [FireDeviceType.Sprinkler]: "喷头",
};

export const TYPE_OPTIONS = [
  { label: "全部类型", value: "" },
  { label: "灭火器", value: FireDeviceType.Extinguisher },
  { label: "消火栓", value: FireDeviceType.Hydrant },
  { label: "报警按钮", value: FireDeviceType.Alarm },
  { label: "喷头", value: FireDeviceType.Sprinkler },
];

export const STATUS_LABEL: Record<FireDeviceStatus, string> = {
  [FireDeviceStatus.Normal]: "正常",
  [FireDeviceStatus.Abnormal]: "异常",
  [FireDeviceStatus.Maintenance]: "维护中",
};

export const STATUS_COLOR: Record<FireDeviceStatus, string> = {
  [FireDeviceStatus.Normal]: "green",
  [FireDeviceStatus.Abnormal]: "red",
  [FireDeviceStatus.Maintenance]: "orange",
};

export const STATUS_OPTIONS = [
  { label: "全部状态", value: "" },
  { label: "正常", value: FireDeviceStatus.Normal },
  { label: "异常", value: FireDeviceStatus.Abnormal },
  { label: "维护中", value: FireDeviceStatus.Maintenance },
];
