import { CubeDeviceCenterService } from "@ghcloud/cube-iot-center-service";

import { readNorthAuthForGateway } from "./api/auth-store";

/**
 * 与 IoT Center App 一致：使用 `@ghcloud/cube-iot-center-service` + CubeGateway。
 * 每次构造服务以读取最新 session / URL 调试参数（见 `readNorthAuthForGateway`）。
 * @see prod/cube/apps/iot-center/app/src/service.ts
 */
export function getCubeDeviceCenterService(): CubeDeviceCenterService {
  return new CubeDeviceCenterService(readNorthAuthForGateway());
}
