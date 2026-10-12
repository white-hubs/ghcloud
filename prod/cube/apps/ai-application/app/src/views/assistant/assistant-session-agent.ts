/**
 * 从会话详情解析绑定的智能体 id（历史切换时回填选中智能体）。
 * 服务端 Session 含 agentId；助手摘要层曾可能丢弃该字段，故以 get 详情为准。
 */
export function pickSessionAgentId(session: { agentId?: string | null } | null | undefined): string {
  return session?.agentId?.trim() ?? "";
}

export async function fetchSessionAgentId(
  getSession: (sessionId: string) => Promise<{ agentId?: string | null } | null | undefined>,
  sessionId: string,
): Promise<string> {
  const id = sessionId.trim();
  if (!id) {
    return "";
  }
  const session = await getSession(id);
  return pickSessionAgentId(session);
}
