import {
  CubeAlarmCenterService,
  CubeAlarmStatService,
  CubeDeviceCenterService,
  CubeLinkageService,
} from "@ghcloud/cube-alarm-center-service";
import { CubeDictionaryService } from "@ghcloud/cube-dictionary-service";
import { CubeFileService } from "@ghcloud/cube-file-service";
import { CubeLinkageService as CubeBusinessLinkageService } from "@ghcloud/cube-linkage-service";
import { CubeOuaaService } from "@ghcloud/cube-ouaa-service";

import { authStore } from "@/stores/auth";

export const cubeAlarmCenterService = new CubeAlarmCenterService(authStore);
export const cubeAlarmStatService = new CubeAlarmStatService(authStore);
export const cubeDictionaryService = new CubeDictionaryService(authStore);
export const cubeOuaaService = new CubeOuaaService(authStore);
export const cubeDeviceCenterService = new CubeDeviceCenterService(authStore);
export const cubeFileService = new CubeFileService(authStore);
export const cubeLinkageService = new CubeLinkageService(authStore);
export const linkageService = new CubeBusinessLinkageService(authStore);
