import { CubeAssetManagementService } from "@ghcloud/cube-asset-management-service";

import { authStore } from "./auth-store";

export const cubeAssetManagementService = new CubeAssetManagementService(authStore);
