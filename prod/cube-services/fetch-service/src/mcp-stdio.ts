import "reflect-metadata";
import { runMcpStdio } from "./transport/mcp/run-mcp-stdio";

runMcpStdio().catch((error) => {
  console.error("[FetchService][MCP stdio] failed to start", error);
  process.exit(1);
});
