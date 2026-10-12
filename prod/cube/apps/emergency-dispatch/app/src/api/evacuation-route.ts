import type {
  EvacuationRouteCreatePayload,
  EvacuationRouteDevicesPayload,
  EvacuationRoutePageQuery,
  EvacuationRouteUpdatePayload,
  EvacuationRouteVO,
  PageResult,
} from "@ghcloud/cube-emergency-dispatch-service";

import { cubeEmergencyDispatchService } from "./service";

export type {
  EvacuationRouteCreatePayload,
  EvacuationRouteDevicesPayload,
  EvacuationRoutePageQuery,
  EvacuationRouteUpdatePayload,
  EvacuationRouteVO,
  PageResult,
};

export const pageEvacuationRoutes = (query: EvacuationRoutePageQuery): Promise<PageResult<EvacuationRouteVO>> =>
  cubeEmergencyDispatchService.pageEvacuationRoutes(query);

export const createEvacuationRoute = (payload: EvacuationRouteCreatePayload): Promise<EvacuationRouteVO | void> =>
  cubeEmergencyDispatchService.createEvacuationRoute(payload);

export const updateEvacuationRoute = (id: string, payload: EvacuationRouteUpdatePayload): Promise<EvacuationRouteVO | void> =>
  cubeEmergencyDispatchService.updateEvacuationRoute(id, payload);

export const deleteEvacuationRoute = (id: string): Promise<void> => cubeEmergencyDispatchService.deleteEvacuationRoute(id);

export const updateEvacuationRouteDevices = (id: string, payload: EvacuationRouteDevicesPayload): Promise<void> =>
  cubeEmergencyDispatchService.updateEvacuationRouteDevices(id, payload);
