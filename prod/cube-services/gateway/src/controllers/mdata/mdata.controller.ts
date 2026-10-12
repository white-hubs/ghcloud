import { Body, Controller, DELETE, GET, Param, POST, PUT, QueryMap } from "@dangao/bun-server";

import type {
  AreaScenePanelConfig,
  BusinessAreaNode,
  CreateSceneTypeMenuParams,
  ListSceneTypeMenusParams,
  SaveAreaScenePanelConfigParams,
  SceneTypeMenu,
  UpdateSceneTypeMenuParams,
} from "@ghcloud/cube-service-interface/mdata";

import { CubeAuthProxy } from "@/decorators/cube-auth-proxy.decorator";
import { MdataProxyService } from "@/services/proxy/mdata/mdata-proxy.service";

/**
 * HTTP 层用 path/query 拆参，与 MdataGateway 的单对象入参形状不完全一致，故不 implements。
 * 契约由 client + proxy 对齐；stall 等能力当前走 /api/mdata。
 */
@Controller("/gw-bff/mdata")
export class MdataController {
  public constructor(private readonly mdataProxyService: MdataProxyService) {}

  @GET("/scene-type/page")
  @CubeAuthProxy()
  public async listSceneTypeMenus(@QueryMap() params: ListSceneTypeMenusParams): Promise<SceneTypeMenu[]> {
    return await this.mdataProxyService.listSceneTypeMenus(params);
  }

  @POST("/scene-type")
  @CubeAuthProxy()
  public async createSceneTypeMenu(@Body() params: CreateSceneTypeMenuParams): Promise<unknown> {
    return await this.mdataProxyService.createSceneTypeMenu(params);
  }

  @PUT("/scene-type/:id")
  @CubeAuthProxy()
  public async updateSceneTypeMenu(@Param("id") id: string, @Body() params: Omit<UpdateSceneTypeMenuParams, "id">): Promise<unknown> {
    return await this.mdataProxyService.updateSceneTypeMenu({ ...params, id });
  }

  @DELETE("/scene-type/:id")
  @CubeAuthProxy()
  public async deleteSceneTypeMenu(@Param("id") id: string): Promise<void> {
    await this.mdataProxyService.deleteSceneTypeMenu(id);
  }

  @GET("/area-scene-config/panel/:areaId/:sceneType")
  @CubeAuthProxy()
  public async getAreaScenePanelConfig(
    @Param("areaId") areaId: string,
    @Param("sceneType") sceneType: string,
  ): Promise<AreaScenePanelConfig[]> {
    return await this.mdataProxyService.getAreaScenePanelConfig({ areaId, sceneType });
  }

  @POST("/area-scene-config/panel/disposable-save")
  @CubeAuthProxy()
  public async saveAreaScenePanelConfig(@Body() params: SaveAreaScenePanelConfigParams): Promise<unknown> {
    return await this.mdataProxyService.saveAreaScenePanelConfig(params);
  }

  @GET("/area/list")
  @CubeAuthProxy()
  public async listBusinessAreas(): Promise<BusinessAreaNode[]> {
    return await this.mdataProxyService.listBusinessAreas();
  }
}
