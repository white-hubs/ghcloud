import { Body, Controller, Param, POST } from "@dangao/bun-server";

import type {
  AreaEmptyDeviceTotal,
  BindVisualDevicesParams,
  CountAreaEmptyDevicesParams,
  DeviceInstancePageResult,
  ListVisualBoundDevicesParams,
  UnbindVisualDevicesParams,
} from "@ghcloud/cube-service-interface/device-center";

import { CubeAuthProxy } from "@/decorators/cube-auth-proxy.decorator";
import { DeviceCenterProxyService } from "@/services/proxy/device-center/device-center-proxy.service";

@Controller("/gw-bff/device-center")
export class DeviceCenterController {
  public constructor(private readonly deviceCenterProxyService: DeviceCenterProxyService) {}

  @POST("/device/instance/page")
  @CubeAuthProxy()
  public async listVisualBoundDevices(@Body() params: ListVisualBoundDevicesParams): Promise<DeviceInstancePageResult> {
    return await this.deviceCenterProxyService.listVisualBoundDevices(params);
  }

  @POST("/device-scene-config")
  @CubeAuthProxy()
  public async bindVisualDevices(@Body() params: BindVisualDevicesParams): Promise<unknown> {
    return await this.deviceCenterProxyService.bindVisualDevices(params);
  }

  @POST("/device-scene-config/:sceneType/delete/devices")
  @CubeAuthProxy()
  public async unbindVisualDevices(
    @Param("sceneType") sceneType: string,
    @Body() params: Pick<UnbindVisualDevicesParams, "businessIds">,
  ): Promise<unknown> {
    return await this.deviceCenterProxyService.unbindVisualDevices({
      sceneType,
      businessIds: params.businessIds,
    });
  }

  @POST("/device/area-empty/device-total")
  @CubeAuthProxy()
  public async countAreaEmptyDevices(@Body() params: CountAreaEmptyDevicesParams): Promise<AreaEmptyDeviceTotal> {
    return await this.deviceCenterProxyService.countAreaEmptyDevices(params);
  }
}
