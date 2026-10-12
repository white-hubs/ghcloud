import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

import { loadAppConfig } from "../../config/app.config";
import { FetchService } from "../../services/fetch.service";
import { createMcpServer } from "./create-mcp-server";

export async function runMcpStdio(): Promise<void> {
  const config = loadAppConfig();
  const fetchService = new FetchService();
  const server = createMcpServer(fetchService, config);
  const transport = new StdioServerTransport();
  await server.connect(transport);
}
