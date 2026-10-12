import {
  CubeAlarmCenterService,
  CubeAlarmSafetyAnalysisService,
  CubeAlarmStatService,
  CubeLinkageService,
} from "@ghcloud/cube-alarm-center-service";
import { CubeDictionaryService } from "@ghcloud/cube-dictionary-service";
import { CubeFileService } from "@ghcloud/cube-file-service";
import { CubeDeviceCenterService } from "@ghcloud/cube-iot-center-service";
import { CubeLinkageService as ACubeLinkageService } from "@ghcloud/cube-linkage-service";
import { CubeMdataService } from "@ghcloud/cube-mdata-service";
import { CubeOuaaService } from "@ghcloud/cube-ouaa-service";

import { authStore } from "./auth-store";

export const cubeAlarmCenterService = new CubeAlarmCenterService(authStore);
export const cubeAlarmStatService = new CubeAlarmStatService(authStore);
export const cubeMdataService = new CubeMdataService(authStore);
export const cubeOuaaService = new CubeOuaaService(authStore);
export const cubeFileService = new CubeFileService(authStore);
export const cubeDeviceCenterService = new CubeDeviceCenterService(authStore);
export const cubeLinkageService = new CubeLinkageService(authStore);
export const cubeAlarmSafetyAnalysisService = new CubeAlarmSafetyAnalysisService(authStore);
export const cubeDictionaryService = new CubeDictionaryService(authStore);
export const linkageService = new ACubeLinkageService(authStore);
