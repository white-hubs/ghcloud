import { CubeFileService } from "@ghcloud/cube-file-service";

import { authStore } from "@/stores/auth";

export const cubeFileService = new CubeFileService(authStore);
