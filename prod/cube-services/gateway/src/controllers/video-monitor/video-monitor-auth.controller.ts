import {
  Controller,
  GET,
  POST,
  PUT,
  DELETE,
  Param,
  Body,
  QueryMap,
} from '@dangao/bun-server';
import { VideoMonitorProxyService } from '@/services/proxy/video-monitor/video-monitor-proxy.service';
import { CubeAuthProxy } from '@/decorators/cube-auth-proxy.decorator';
import type {
  AuthGroupModifyParam,
  DeviceAuth,
  ListDeviceAuthParams,
  VideoMonitorAuthGateway,
} from '@ghcloud/cube-service-interface/video-monitor';
import type { Pagination } from '@ghcloud/cube-service-interface/base';

/**
 * 视频监控授权控制器
 * 实现 VideoMonitorAuthGateway 接口
 */
@Controller('/gw-bff/video-monitor/camera-auths')
export class VideoMonitorAuthController implements VideoMonitorAuthGateway {
  constructor(
    private readonly videoMonitorProxyService: VideoMonitorProxyService,
  ) {
  }

  /**
   * 创建摄像头授权
   * POST /api/video-monitor/camera-auths
   */
  @POST('/')
  @CubeAuthProxy()
  public async createAuthGroup(
    @Body() data: AuthGroupModifyParam,
  ): Promise<string> {
    const result = await this.videoMonitorProxyService.createCameraAuth(data);
    return result.id;
  }

  /**
   * 更新摄像头授权
   * PUT /api/video-monitor/camera-auths/:id
   */
  @PUT('/:id')
  @CubeAuthProxy()
  public async updateAuthGroup(
    @Param('id') id: string,
    @Body() data: AuthGroupModifyParam,
  ): Promise<void> {
    await this.videoMonitorProxyService.updateCameraAuth(id, data);
  }

  /**
   * 删除摄像头授权
   * DELETE /api/video-monitor/camera-auths/:id
   */
  @DELETE('/:id')
  @CubeAuthProxy()
  public async deleteAuthGroup(@Param('id') id: string): Promise<void> {
    await this.videoMonitorProxyService.deleteCameraAuth(id);
  }

  /**
   * 获取摄像头授权详情
   * GET /api/video-monitor/camera-auths/:id
   */
  @GET('/:id')
  @CubeAuthProxy()
  public async getAuthGroup(@Param('id') id: string): Promise<DeviceAuth> {
    return await this.videoMonitorProxyService.getCameraAuthDetail(id);
  }

  /**
   * 获取摄像头授权列表
   * GET /api/video-monitor/camera-auths
   */
  @GET('/')
  @CubeAuthProxy()
  public async listAuthGroup(
    @QueryMap() params: ListDeviceAuthParams,
  ): Promise<Pagination<DeviceAuth>> {
    return await this.videoMonitorProxyService.getCameraAuthList(params);
  }

}
