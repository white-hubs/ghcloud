/** MCP web_fetch 工具定义 */
export const WEB_FETCH_TOOL_NAME = "web_fetch";

export const WEB_FETCH_TOOL_DESCRIPTION =
  "Fetch a single URL, extract readable article text (readability), and answer a prompt about it (claw-code WebFetch compatible).";

export const WEB_FETCH_INPUT_SCHEMA = {
  type: "object",
  required: ["url", "prompt"],
  properties: {
    url: { type: "string" },
    prompt: { type: "string", description: "Agent intent; drives token-efficient result (title/summary/preview)" },
    timeoutMs: { type: "integer", minimum: 1000 },
    maxRedirects: { type: "integer", minimum: 0 },
    userAgent: { type: "string" },
  },
} as const;
