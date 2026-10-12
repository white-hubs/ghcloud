import "reflect-metadata";
import { Application, ConfigModule, ExceptionFilterRegistry } from "@dangao/bun-server";

import { AppModule } from "./app.module";
import { loadAppConfig } from "./config/app.config";
import { FetchErrorFilter } from "./filters/fetch-error.filter";
import { registerMcpHttpMiddleware } from "./transport/mcp/register-mcp-http.middleware";
import { registerFetchAuthMiddleware } from "./transport/rest/fetch.controller";

async function bootstrap(): Promise<void> {
  const config = loadAppConfig();

  ConfigModule.forRoot({
    defaultConfig: {
      app: {
        name: "@ghcloud/cube-fetch-service",
        ...config,
      },
    },
  });

  ExceptionFilterRegistry.getInstance().register(new FetchErrorFilter());

  const app = new Application({
    port: config.port,
    hostname: config.hostname,
  });

  app.registerModule(AppModule);
  registerFetchAuthMiddleware(app);
  await registerMcpHttpMiddleware(app);

  await app.listen();
}

bootstrap().catch((error) => {
  console.error("[FetchService] failed to start", error);
  process.exit(1);
});
