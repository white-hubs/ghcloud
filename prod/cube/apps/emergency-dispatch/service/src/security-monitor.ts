import type {
  MonitorCameraDevice,
  SecurityUserDeviceAuthDevice,
  SecurityUserDeviceAuthPageQuery,
  SecurityUserDeviceAuthRecord,
} from "./types";

function resolveDeviceId(device: SecurityUserDeviceAuthDevice | SecurityUserDeviceAuthRecord): string {
  const id = device.deviceId ?? device.id ?? device.code;
  return id == null ? "" : String(id);
}

function mapAuthDeviceToCamera(device: SecurityUserDeviceAuthDevice | SecurityUserDeviceAuthRecord): MonitorCameraDevice | null {
  const id = resolveDeviceId(device);
  if (!id) {
    return null;
  }
  const name = device.deviceName ?? device.name ?? device.code ?? id;
  return {
    id,
    name,
    category: device.productCategoryName ?? device.categoryName ?? "摄像机",
    area: device.areaName ?? "--",
  };
}

/** 将用户监控设备授权分页结果扁平化为设备列表（去重） */
export function flattenSecurityUserDeviceAuthRecords(records: SecurityUserDeviceAuthRecord[]): MonitorCameraDevice[] {
  const deviceMap = new Map<string, MonitorCameraDevice>();

  for (const record of records) {
    if (Array.isArray(record.devices) && record.devices.length > 0) {
      for (const nested of record.devices) {
        const mapped = mapAuthDeviceToCamera(nested);
        if (mapped) {
          deviceMap.set(mapped.id, mapped);
        }
      }
      continue;
    }

    const mapped = mapAuthDeviceToCamera(record);
    if (mapped) {
      deviceMap.set(mapped.id, mapped);
    }
  }

  return [...deviceMap.values()];
}

export function buildSecurityUserDeviceAuthPageQuery(
  input: Partial<SecurityUserDeviceAuthPageQuery> & Pick<SecurityUserDeviceAuthPageQuery, "applicationCode">,
): SecurityUserDeviceAuthPageQuery {
  return {
    pageNumber: input.pageNumber ?? 1,
    pageSize: input.pageSize ?? 500,
    applicationCode: input.applicationCode,
    ...(input.keyword?.trim() ? { keyword: input.keyword.trim() } : {}),
    ...(input.organizationId ? { organizationId: input.organizationId } : {}),
    ...(input.deviceId ? { deviceId: input.deviceId } : {}),
  };
}
