import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";

import type { AppConfig } from "../../config/app.config";
import type { FetchService } from "../../services/fetch.service";
import { createMcpServer } from "./create-mcp-server";

export interface McpHttpHandler {
  path: string;
  handle(request: Request): Promise<Response>;
}

export async function createMcpHttpHandler(fetchService: FetchService, config: AppConfig): Promise<McpHttpHandler> {
  const server = createMcpServer(fetchService, config);
  const transport = new WebStandardStreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
  });
  await server.connect(transport);

  return {
    path: config.mcpPath,
    handle: (request: Request): Promise<Response> => transport.handleRequest(request),
  };
}

export function isMcpHttpPath(path: string, mcpPath: string): boolean {
  return path === mcpPath || path.startsWith(`${mcpPath}/`);
}
