import {
  Controller,
  GET,
  POST,
  PUT,
  DELETE,
  Param,
  Body,
  NotFoundException,
  validateObject,
  BadRequestException,
} from "@dangao/bun-server";

import { CreatePageDto } from "./dto/create-page.dto";
import { UpdatePageDto } from "./dto/update-page.dto";
import { PageService } from "./page.service";

@Controller("/scada/api/pages")
export class PageController {
  constructor(private readonly pageService: PageService) {}

  @GET("/")
  async list() {
    return this.pageService.findAll();
  }

  @GET("/electrical-center")
  async getElectricalCenter() {
    return this.pageService.findElectricalCenter();
  }

  @GET("/:id")
  async get(@Param("id") id: string) {
    const page = await this.pageService.findById(id);
    if (!page) throw new NotFoundException(`Page ${id} not found`);
    return page;
  }

  @POST("/")
  async create(@Body() dto: CreatePageDto) {
    validateObject(dto, CreatePageDto);
    const id = `page-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    return this.pageService.create(id, dto.name, dto.content ?? "{}", dto.project_id, dto.thumbnail);
  }

  @PUT("/:id")
  async update(@Param("id") id: string, @Body() dto: UpdatePageDto) {
    validateObject(dto, UpdatePageDto);
    const existing = await this.pageService.findById(id);
    if (!existing) throw new NotFoundException(`Page ${id} not found`);
    return this.pageService.update(
      id,
      dto.name ?? existing.name,
      dto.content ?? existing.content,
      dto.project_id !== undefined ? dto.project_id : undefined,
      dto.thumbnail !== undefined ? dto.thumbnail : undefined,
    );
  }

  @DELETE("/:id")
  async remove(@Param("id") id: string) {
    await this.pageService.remove(id);
    return { success: true };
  }

  @POST("/:id/copy")
  async copy(@Param("id") id: string) {
    const existing = await this.pageService.findById(id);
    if (!existing) throw new NotFoundException(`Page ${id} not found`);
    const copied = await this.pageService.copy(id);
    if (!copied) throw new BadRequestException("Copy failed");
    return copied;
  }
}
