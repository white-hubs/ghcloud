import { createAgenticClient } from "@cube-ai/agent-sdk-client";

import { resolveAgenticEngineAuthToken } from "./assistant-agentic-auth";
import { resolveAgenticEngineBase } from "@/api/ai-center-api-base";
import { authStore } from "@/api/auth-store";

const SESSION_COUNT_PAGE_SIZE = 100;

export interface AssistantSessionPageItem {
  id: string;
  title: string;
  updatedAt: number;
}

export interface AssistantSessionPage {
  items: AssistantSessionPageItem[];
  nextCursor?: string;
  hasMore: boolean;
}

function createAssistantSessionClient() {
  return createAgenticClient({
    baseUrl: resolveAgenticEngineBase(),
    auth: {
      provider: () => resolveAgenticEngineAuthToken(authStore.token),
    },
    headersProvider: () => ({
      tenant: authStore.tenant,
      terminal: String(authStore.terminal),
    }),
  });
}

export async function fetchAssistantSessionCount(): Promise<number> {
  let count = 0;
  let cursor: string | undefined;

  do {
    const page = await fetchAssistantSessionPage(cursor);
    count += page.items.length;
    cursor = page.hasMore ? page.nextCursor : undefined;
  } while (cursor);

  return count;
}

export async function fetchAssistantSessionPage(cursor?: string): Promise<AssistantSessionPage> {
  const client = createAssistantSessionClient();
  const page = await client.sessions.list({
    limit: SESSION_COUNT_PAGE_SIZE,
    purpose: "chat",
    ...(cursor ? { cursor } : {}),
  });

  return {
    items: page.items.map((item) => ({
      id: item.id,
      title: item.title ?? "",
      updatedAt: item.updateTime,
    })),
    nextCursor: page.page.nextCursor ?? undefined,
    hasMore: page.page.hasMore,
  };
}
