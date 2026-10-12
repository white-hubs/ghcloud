import { Body, Controller, POST, UnauthorizedException, type Middleware, type Context, type NextFunction } from "@dangao/bun-server";

import { loadAppConfig } from "../../config/app.config";
import type { FetchResponse } from "../../contracts/types";
import { validateFetchArticleRequest, validateFetchIndexRequest } from "../../dto/fetch-request.dto";
import { FetchRequestBodyTooLargeError } from "../../fetch-core/fetch-errors";
import { FetchService } from "../../services/fetch.service";
import { isMcpHttpPath } from "../mcp/mcp-http-handler";

function isPublicPath(path: string): boolean {
  if (path === "/health" || path === "/health/") {
    return true;
  }
  const config = loadAppConfig();
  if (config.mcpHttpEnabled && isMcpHttpPath(path, config.mcpPath)) {
    return true;
  }
  return false;
}

export function createBearerAuthMiddleware(token: string, maxRequestBodyBytes = loadAppConfig().maxRequestBodyBytes): Middleware {
  return async (ctx: Context, next: NextFunction) => {
    if (isPublicPath(ctx.path)) {
      return next();
    }

    const contentLength = ctx.request.headers.get("content-length");
    if (contentLength) {
      const parsedLength = Number(contentLength);
      if (Number.isFinite(parsedLength) && parsedLength > maxRequestBodyBytes) {
        throw new FetchRequestBodyTooLargeError(maxRequestBodyBytes);
      }
    }

    if (!token || token.trim() === "") {
      throw new UnauthorizedException("FETCH_SERVICE_TOKEN is not configured");
    }

    const auth = ctx.request.headers.get("authorization");
    if (auth !== `Bearer ${token}`) {
      throw new UnauthorizedException("invalid bearer token");
    }

    return next();
  };
}

@Controller("/fetch")
export class FetchController {
  public constructor(private readonly fetchService: FetchService) {}

  @POST("/index")
  public async fetchIndex(@Body() body: unknown): Promise<FetchResponse> {
    const request = validateFetchIndexRequest(body);
    return this.fetchService.fetchIndex(request);
  }

  @POST("/article")
  public async fetchArticle(@Body() body: unknown): Promise<FetchResponse> {
    const request = validateFetchArticleRequest(body);
    return this.fetchService.fetchArticle(request);
  }
}

export function registerFetchAuthMiddleware(app: { use: (middleware: Middleware) => void }): void {
  const config = loadAppConfig();
  app.use(createBearerAuthMiddleware(config.fetchServiceToken ?? "", config.maxRequestBodyBytes));
}
