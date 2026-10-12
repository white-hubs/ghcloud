import { Controller, GET } from "@dangao/bun-server";

@Controller("/health")
export class HealthController {
  @GET("/")
  public check() {
    return {
      status: "ok",
      timestamp: new Date().toISOString(),
      service: "@ghcloud/cube-fetch-service",
    };
  }
}
