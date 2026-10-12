import {
  CubeBiDataManagementService,
  CubeFoodSafetyService,
  CubeVehicleStatisticsService,
  CubeTransportStatisticsService,
} from "@ghcloud/cube-bi-data-management";
import { CubeDictionaryService } from "@ghcloud/cube-dictionary-service";

import { authStore } from "./auth-store";

export const cubeBiDataManagementService = new CubeBiDataManagementService(authStore);
export const cubeFoodSafetyService = new CubeFoodSafetyService(authStore);
export const cubeVehicleStatisticsService = new CubeVehicleStatisticsService(authStore);
export const cubeTransportStatisticsService = new CubeTransportStatisticsService(authStore);
export const cubeDictionaryService = new CubeDictionaryService(authStore);
