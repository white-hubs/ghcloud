import { CubeGateway, type CubeAuth, type LegacyServiceError } from "@ghcloud/cube-gateway";
import { BASE_API } from "@ghcloud/cube-protocol";

import type { DeviceCenterInternalDetailVO, ProductProp } from "./types";

export interface DevicePropertyValue {
  key: string;
  value: unknown;
  ts?: number | null;
}

/** 指令提交回执，PROCESSING 不代表设备已执行成功。 */
export interface DeviceCommandResponse {
  commandSeq: string;
  commandHandle: string;
  statusCode: string;
  message: string;
}

/** 应急任务联动设备专用接口。 */
export class EmergencyDeviceService {
  private readonly gateway: CubeGateway;

  public constructor(auth: CubeAuth) {
    this.gateway = new CubeGateway(auth);
  }

  public async getDeviceDetail(payload: { deviceId: string }): Promise<DeviceCenterInternalDetailVO> {
    const url = `${BASE_API}/device-center/device/mgt/${payload.deviceId}`;
    const resp = await this.gateway.get<LegacyServiceError<DeviceCenterInternalDetailVO>>({ url, payload });
    return resp.data || resp;
  }

  public async getProductPropList(payload: { prodId: string | number }): Promise<ProductProp[]> {
    const url = `${BASE_API}/device-center/things/product-prop/list`;
    const resp = await this.gateway.get<LegacyServiceError<ProductProp[]>>({ url, payload });
    return resp.data || resp;
  }

  public async getEmergencyDevicePropertyValues(payload: { deviceId: string }): Promise<{ propValList: DevicePropertyValue[] }> {
    const url = `${BASE_API}/device-center/device/mgt/devRelVal/${payload.deviceId}`;
    const resp = await this.gateway.get<LegacyServiceError<{ propValList: DevicePropertyValue[] }>>({ url, payload });
    return resp.data || resp;
  }

  public async issueEmergencyDevicePropertyCommand(payload: {
    commandSeq: string;
    deviceId: string;
    propCode: string;
    propValue: string;
  }): Promise<DeviceCommandResponse> {
    const url = `${BASE_API}/iot/north/device/command/issue`;
    const resp = await this.gateway.custom<LegacyServiceError<DeviceCommandResponse>>({ url, payload, method: "POST" });
    return resp.data || resp;
  }
}
