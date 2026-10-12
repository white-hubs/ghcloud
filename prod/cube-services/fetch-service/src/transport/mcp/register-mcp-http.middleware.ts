import type { Application, Middleware } from "@dangao/bun-server";

import { loadAppConfig } from "../../config/app.config";
import { FetchService } from "../../services/fetch.service";
import { createMcpHttpHandler, isMcpHttpPath } from "./mcp-http-handler";

export async function registerMcpHttpMiddleware(app: Application): Promise<void> {
  const config = loadAppConfig();
  if (!config.mcpHttpEnabled) {
    return;
  }

  const handler = await createMcpHttpHandler(new FetchService(), config);

  const middleware: Middleware = async (ctx, next) => {
    if (!isMcpHttpPath(ctx.path, handler.path)) {
      return next();
    }
    return handler.handle(ctx.request);
  };

  app.use(middleware);
}
