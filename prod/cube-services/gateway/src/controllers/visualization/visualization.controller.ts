import { Body, Controller, DELETE, GET, Param, POST, PUT, Query } from "@dangao/bun-server";

import type {
  CreateVisualProjectParams,
  UpdateVisualProjectParams,
  VisualModelConfigurationPayload,
  VisualModelConfigurationResult,
  VisualizationGateway,
  VisualProject,
} from "@ghcloud/cube-service-interface/visualization";

import { CubeAuthProxy } from "@/decorators/cube-auth-proxy.decorator";
import { VisualizationProxyService } from "@/services/proxy/visualization/visualization-proxy.service";

@Controller("/gw-bff/visualization")
export class VisualizationController implements VisualizationGateway {
  public constructor(private readonly visualizationProxyService: VisualizationProxyService) {}

  @GET("/project/queryProjectAll")
  @CubeAuthProxy()
  public async listVisualProjects(): Promise<VisualProject[]> {
    return await this.visualizationProxyService.listVisualProjects();
  }

  @POST("/project/insert")
  @CubeAuthProxy()
  public async createVisualProject(@Body() params: CreateVisualProjectParams): Promise<unknown> {
    return await this.visualizationProxyService.createVisualProject(params);
  }

  @PUT("/project/update")
  @CubeAuthProxy()
  public async updateVisualProject(@Body() params: UpdateVisualProjectParams): Promise<unknown> {
    return await this.visualizationProxyService.updateVisualProject(params);
  }

  @DELETE("/project/:id")
  @CubeAuthProxy()
  public async deleteVisualProject(@Param("id") id: string): Promise<void> {
    await this.visualizationProxyService.deleteVisualProject(id);
  }

  @POST("/project/copy/:id")
  @CubeAuthProxy()
  public async copyVisualProject(@Param("id") id: string): Promise<void> {
    await this.visualizationProxyService.copyVisualProject(id);
  }

  @GET("/model-configuration")
  @CubeAuthProxy()
  public async getVisualModelConfiguration(@Query("projectId") projectId: string): Promise<VisualModelConfigurationResult> {
    return await this.visualizationProxyService.getVisualModelConfiguration(projectId);
  }

  @POST("/add-model-configuration")
  @CubeAuthProxy()
  public async saveVisualModelConfiguration(@Body() params: VisualModelConfigurationPayload): Promise<unknown> {
    return await this.visualizationProxyService.saveVisualModelConfiguration(params);
  }
}
