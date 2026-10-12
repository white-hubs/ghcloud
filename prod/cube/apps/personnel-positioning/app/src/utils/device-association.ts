import type { DeviceSelectRecord } from "@ghcloud/cube-app-design";

import { DEVICE_TYPES } from "../constants/positioning";
import type { AssociableDeviceKind, DeviceType, PositioningDevice } from "../models/positioning";

/** 仅适配公共组件选中结果，不干预组件的数据请求或筛选条件。 */
export function toPositioningDevice(record: DeviceSelectRecord, kind: AssociableDeviceKind): PositioningDevice {
  const sourceDeviceId = String(record.id ?? "").trim();
  if (!sourceDeviceId) throw new Error("所选设备缺少设备 ID，请重新选择");
  const categoryCode = record.productInfo?.productCategory?.code ?? "";
  const knownType = categoryCode as DeviceType;
  const type = Object.hasOwn(DEVICE_TYPES, categoryCode) && DEVICE_TYPES[knownType].kind === kind ? knownType : kind;
  return {
    id: record.code?.trim() || sourceDeviceId,
    sourceDeviceId,
    name: record.name || "",
    kind,
    type,
    model: record.productInfo?.modelName || record.model || "—",
    vendor: record.productInfo?.brandName || record.brand || "—",
    online: record.status?.onlineState === true ? "online" : record.status?.onlineState === false ? "offline" : "pending",
    battery: null,
    enabled: true,
    syncedAt: new Date().toISOString(),
    lastSeenAt: null,
    space: record.area?.pathName || record.area?.name || record.region || "",
    coordinate: "",
    gatewayState: null,
    linkedStationIds: [],
  };
}
