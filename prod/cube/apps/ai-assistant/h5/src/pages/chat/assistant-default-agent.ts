const DEFAULT_AGENT_STORAGE_KEY = "cube-ai-application.default-agent-id";

export function readDefaultAgentId(): string | null {
  if (typeof localStorage === "undefined") {
    return null;
  }
  const value = localStorage.getItem(DEFAULT_AGENT_STORAGE_KEY)?.trim();
  return value || null;
}

export function writeDefaultAgentId(agentId: string): void {
  if (typeof localStorage === "undefined") {
    return;
  }
  localStorage.setItem(DEFAULT_AGENT_STORAGE_KEY, agentId.trim());
}
