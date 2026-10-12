import type { EvacuationRoutePageQuery, EvacuationRouteVO, PageResult } from "@ghcloud/cube-emergency-dispatch-service";

import { cubeEmergencyDispatchService } from "./server";

export type { EvacuationRoutePageQuery, EvacuationRouteVO, PageResult };

export const pageEvacuationRoutes = (query: EvacuationRoutePageQuery): Promise<PageResult<EvacuationRouteVO>> =>
  cubeEmergencyDispatchService.pageEvacuationRoutes(query);
