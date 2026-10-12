import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import * as z from "zod";

import type { AppConfig } from "../../config/app.config";
import { WEB_FETCH_TOOL_DESCRIPTION, WEB_FETCH_TOOL_NAME } from "../../contracts/tool-schema";
import type { FetchService } from "../../services/fetch.service";
import { toWebFetchToolResult } from "./map-mcp-response";

export function createMcpServer(fetchService: FetchService, config: AppConfig): McpServer {
  const server = new McpServer({
    name: "@ghcloud/cube-fetch-service",
    version: "0.0.1",
  });

  server.registerTool(
    WEB_FETCH_TOOL_NAME,
    {
      description: WEB_FETCH_TOOL_DESCRIPTION,
      inputSchema: {
        url: z.string().describe("HTTP or HTTPS URL to fetch"),
        prompt: z.string().describe("Agent intent; drives token-efficient summary (claw-code WebFetch)"),
        timeoutMs: z.number().int().min(1000).max(config.maxTimeoutMs).optional(),
        maxRedirects: z.number().int().min(0).max(config.maxRedirects).optional(),
        userAgent: z.string().optional(),
      },
    },
    async ({ url, prompt, timeoutMs, maxRedirects, userAgent }) => {
      const response = await fetchService.fetchArticle({
        url,
        prompt,
        timeoutMs,
        maxRedirects,
        userAgent,
      });

      const payload = toWebFetchToolResult(response, prompt, response.rawBody);
      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(payload, null, 2),
          },
        ],
      };
    },
  );

  return server;
}
