import type { AreaPlaneMapVO } from "@ghcloud/cube-emergency-dispatch-service";

import { cubeEmergencyDispatchService } from "./server";

export type { AreaPlaneMapVO };

export const listAreaPlaneMapsByAreaId = (areaId: string | number): Promise<AreaPlaneMapVO[]> =>
  cubeEmergencyDispatchService.listAreaPlaneMapsByAreaId(areaId);
