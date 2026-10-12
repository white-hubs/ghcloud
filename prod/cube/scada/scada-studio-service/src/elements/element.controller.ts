import { parseSvgElement } from "@cube-scada/core";
import { Controller, GET, POST, DELETE, Param, Body, NotFoundException } from "@dangao/bun-server";

import { ElementService } from "./element.service";

@Controller("/scada/api/elements")
export class ElementController {
  constructor(private readonly elementService: ElementService) {}

  @GET("/")
  async list() {
    return this.elementService.findAll();
  }

  @GET("/:type/svg")
  async getSvg(@Param("type") type: string) {
    const element = await this.elementService.findByType(type);
    if (!element) throw new NotFoundException(`Element ${type} not found`);
    return new Response(element.svg_content, {
      headers: {
        "Content-Type": "image/svg+xml",
      },
    });
  }

  @POST("/upload")
  async upload(@Body() body: { svgContent: string }) {
    const def = parseSvgElement(body.svgContent);
    const record = await this.elementService.upsert(def.type, def.label, def.category, def.version, body.svgContent);
    return { success: true, element: { type: record.type, label: record.label, category: record.category } };
  }

  @DELETE("/:type")
  async remove(@Param("type") type: string) {
    await this.elementService.remove(type);
    return { success: true };
  }
}
