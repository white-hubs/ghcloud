import { cubeAppService } from "@ghcloud/cube-app-js-sdk";
import { getEnvironment } from "@ghcloud/cube-app-js-sdk/src/js/cube-h5-config";

import {
  cubeAssetManagementService,
  cubeDailyInspectionService,
  cubeDeviceCenterService,
  cubeMdataService,
  cubePropertyService,
  cubeSmallEngineeringService,
} from "@/api/server";

export interface UpdateObjectLocationPayload {
  entityId: string;
  entityType: string;
}

const LOCATION_SUPPORTED_ENTITY_TYPES = new Set(["DEVICE", "PROPERTY", "STALL", "SITE_POINT", "SMALL_ENGINEERING", "RISK_SOURCE"]);

const isValidCoordinate = (value: number | undefined): value is number => {
  return typeof value === "number" && Number.isFinite(value);
};

export const updateObjectLocationIfAbsent = async ({ entityId, entityType }: UpdateObjectLocationPayload): Promise<void> => {
  if (getEnvironment() !== "cubeApp") return;
  if (!entityId || !LOCATION_SUPPORTED_ENTITY_TYPES.has(entityType)) return;

  try {
    const locationInfo = await cubeAppService.getLocation();
    if (!locationInfo || !isValidCoordinate(locationInfo.latitude) || !isValidCoordinate(locationInfo.longitude)) return;

    const latAndLon = `${locationInfo.longitude},${locationInfo.latitude}`;
    const address = locationInfo.address ?? "";

    switch (entityType) {
      case "DEVICE":
        await cubeDeviceCenterService.updateDeviceLntAndLatIfAbsent({
          deviceId: entityId,
          lntAndLat: latAndLon,
          locationDes: address,
        });
        return;
      case "PROPERTY":
        await cubeAssetManagementService.updateAssetLatAndLonIfAbsent({
          id: entityId,
          latAndLon,
          location: address,
        });
        return;
      case "STALL":
        await cubeMdataService.updateStallLntAndLatIfAbsent(entityId, {
          lntAndLat: latAndLon,
          locationDes: address,
        });
        return;
      case "SITE_POINT":
        await cubeDailyInspectionService.updateSitePointLatAndLonIfAbsent({
          id: entityId,
          latAndLon,
          location: address,
        });
        return;
      case "SMALL_ENGINEERING":
        await cubeSmallEngineeringService.updateProjectScheduleLatAndLonIfAbsent({
          id: entityId,
          latAndLon,
          location: address,
        });
        return;
      case "RISK_SOURCE":
        await cubePropertyService.updateRiskSourceLatAndLonIfAbsent({
          id: entityId,
          latAndLon,
          location: address,
        });
        return;
      default:
        return;
    }
  } catch (error) {
    console.warn("[daily-inspection] update object location failed", error);
  }
};
