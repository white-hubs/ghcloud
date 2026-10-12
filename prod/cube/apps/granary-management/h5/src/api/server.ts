import { CubeGranaryManagementService } from "@ghcloud/cube-granary-management-service";

import { authStore } from "./auth-store";

export const cubeGranaryManagementService = new CubeGranaryManagementService(authStore);
