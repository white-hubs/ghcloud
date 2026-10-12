import { Controller, GET, POST, PUT, DELETE, Param, Body, NotFoundException, validateObject } from "@dangao/bun-server";

import { CreateProjectDto } from "./dto/create-project.dto";
import { UpdateProjectDto } from "./dto/update-project.dto";
import { ProjectService } from "./project.service";

@Controller("/scada/api/projects")
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @GET("/")
  async list() {
    return this.projectService.findAll();
  }

  @GET("/:id")
  async get(@Param("id") id: string) {
    const project = await this.projectService.findById(id);
    if (!project) throw new NotFoundException(`Project ${id} not found`);
    return project;
  }

  @POST("/")
  async create(@Body() dto: CreateProjectDto) {
    validateObject(dto, CreateProjectDto);
    const id = `proj-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    return this.projectService.create(id, dto.name, dto.description ?? "");
  }

  @PUT("/:id")
  async update(@Param("id") id: string, @Body() dto: UpdateProjectDto) {
    validateObject(dto, UpdateProjectDto);
    const existing = await this.projectService.findById(id);
    if (!existing) throw new NotFoundException(`Project ${id} not found`);
    return this.projectService.update(id, dto.name ?? existing.name, dto.description ?? existing.description);
  }

  @DELETE("/:id")
  async remove(@Param("id") id: string) {
    const existing = await this.projectService.findById(id);
    if (!existing) throw new NotFoundException(`Project ${id} not found`);
    await this.projectService.remove(id);
    return { success: true };
  }

  /** List pages belonging to this project */
  @GET("/:id/pages")
  async listPages(@Param("id") id: string) {
    const existing = await this.projectService.findById(id);
    if (!existing) throw new NotFoundException(`Project ${id} not found`);
    return this.projectService.findPages(id);
  }

  /** Assign a page to this project */
  @POST("/:id/assign")
  async assignPage(@Param("id") id: string, @Body() body: { pageId: string }) {
    const existing = await this.projectService.findById(id);
    if (!existing) throw new NotFoundException(`Project ${id} not found`);
    if (!body?.pageId) {
      throw new NotFoundException("pageId is required");
    }
    await this.projectService.assignPage(body.pageId, id);
    return { success: true };
  }
}
