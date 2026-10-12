import type { AreaPlaneMapPayload, AreaPlaneMapVO } from "@ghcloud/cube-emergency-dispatch-service";

import { cubeEmergencyDispatchService } from "./service";

export type { AreaPlaneMapPayload, AreaPlaneMapVO };

export const listAreaPlaneMapsByAreaId = (areaId: string | number): Promise<AreaPlaneMapVO[]> =>
  cubeEmergencyDispatchService.listAreaPlaneMapsByAreaId(areaId);

export const createAreaPlaneMap = (payload: AreaPlaneMapPayload): Promise<AreaPlaneMapVO | void> =>
  cubeEmergencyDispatchService.createAreaPlaneMap(payload);

export const updateAreaPlaneMap = (id: string, payload: AreaPlaneMapPayload): Promise<AreaPlaneMapVO | void> =>
  cubeEmergencyDispatchService.updateAreaPlaneMap(id, payload);

export const deleteAreaPlaneMap = (id: string): Promise<void> => cubeEmergencyDispatchService.deleteAreaPlaneMap(id);
