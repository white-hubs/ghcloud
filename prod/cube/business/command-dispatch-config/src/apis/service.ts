import { CubeDictionaryService } from "@ghcloud/cube-dictionary-service";
import { CubeFileService } from "@ghcloud/cube-file-service";
import { CubeOuaaService } from "@ghcloud/cube-ouaa-service";

import { authStore } from "./auto-store";

export const cubeDictionaryService = new CubeDictionaryService(authStore);
export const cubeFileService = new CubeFileService(authStore);
export const cubeOuaaService = new CubeOuaaService(authStore);
