import { CubeGranaryManagementService } from "@ghcloud/cube-hazard-governance-service";

import { authStore } from "./auth-store";

export const cubeGranaryManagementService = new CubeGranaryManagementService(authStore);
