import type { DeviceInstanceDetail } from "@ghcloud/cube-iot-center-service";

export function extractDeviceDisplayName(detail: DeviceInstanceDetail & { name?: string }, deviceId: string): string {
  const topLevelName = detail.name?.trim();
  if (topLevelName) {
    return topLevelName;
  }
  const archiveName = detail.baseArchivesInfo?.name?.trim();
  if (archiveName) {
    return archiveName;
  }
  return deviceId;
}

export function extractDeviceDisplayArea(detail: DeviceInstanceDetail): string {
  return detail.baseArchivesInfo?.area?.name?.trim() || "--";
}
