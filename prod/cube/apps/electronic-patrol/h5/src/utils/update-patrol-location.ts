import { cubeAppService } from "@ghcloud/cube-app-js-sdk";
import { getEnvironment } from "@ghcloud/cube-app-js-sdk/src/js/cube-h5-config";

import { cubeElectronPatrolService } from "@/api/server";

const normalizeCoordinate = (value: unknown): string | undefined => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value);
  }
  if (typeof value === "string") {
    const coordinate = value.trim();
    return coordinate && Number.isFinite(Number(coordinate)) ? coordinate : undefined;
  }
  return undefined;
};

export const updatePatrolLocationIfAbsent = async (locationId?: string): Promise<void> => {
  if (getEnvironment() !== "cubeApp") {
    return;
  }
  if (!locationId) {
    return;
  }

  try {
    const locationInfo = await cubeAppService.getLocation();
    const patrolLongitude = normalizeCoordinate(locationInfo?.longitude);
    const patrolDimension = normalizeCoordinate(locationInfo?.latitude);
    if (!patrolLongitude || !patrolDimension) {
      return;
    }

    await cubeElectronPatrolService.updatePatrolLocationLatAndLonIfAbsent({
      id: locationId,
      patrolLongitude,
      patrolDimension,
    });
  } catch (error) {
    console.warn("[electronic-patrol] update patrol location failed", error);
  }
};
