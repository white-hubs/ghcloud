import { CubeEmergencyService } from "@ghcloud/cube-emergency-service";
import type { CubeAuth } from "@ghcloud/cube-iot-center-service";
import { EmergencyDeviceService } from "@ghcloud/cube-iot-center-service/src/emergency-device.service";

import { authStore } from "./auth-store";

export const cubeEmergencyService = new CubeEmergencyService(authStore);
export const emergencyDeviceService = new EmergencyDeviceService(authStore as CubeAuth);
