import type { LibraryItemView } from "@cube-ai/contracts";
import { ref, type Ref } from "vue";

import { agentConsoleClient } from "../../api/agent-console-client";
import { filterUserVisibleShelfEntries } from "../../utils/engine-internal-catalog";
import { fetchLibraryAgentLookup } from "../agent-management/agent-data";
import { applyPendingAssistantAgentAvatars, enrichAssistantAgentAvatars, hydrateAuthoredAgentAvatars } from "./assistant-agent-avatar";
import { enrichAssistantAgentDescriptions } from "./assistant-agent-description";
import { SYSTEM_ASSISTANT_AGENTS, buildAssistantAgentOptionsFromShelf, type AssistantAgentOption } from "./assistant-agent-options-builder";
import { readDefaultAgentId } from "./assistant-default-agent";

export type { AssistantAgentOption };
export { SYSTEM_ASSISTANT_AGENTS };
export {
  enrichAssistantAgentDescriptions,
  resolveAssistantAgentDescriptionFromContent,
  resolveAssistantAgentDescriptionFromLibraryItem,
  visibleAssistantAgentDescription,
} from "./assistant-agent-description";

export function useAssistantAgentOptions(): {
  agentOptions: Ref<AssistantAgentOption[]>;
  hasUserAgents: Ref<boolean>;
  loading: Ref<boolean>;
  loadAgentOptions: () => Promise<void>;
  resolveInitialAgentId: (options: AssistantAgentOption[]) => string;
} {
  const agentOptions = ref<AssistantAgentOption[]>([]);
  const hasUserAgents = ref(false);
  const loading = ref(false);

  const loadAgentOptions = async (): Promise<void> => {
    loading.value = true;
    try {
      const [shelfRaw, libraryByRef] = await Promise.all([
        agentConsoleClient.myAgents({ enabled: true }),
        fetchLibraryAgentLookup().catch(() => new Map<string, LibraryItemView>()),
      ]);
      const shelf = filterUserVisibleShelfEntries(shelfRaw);
      const agentShelf = shelf.filter((entry) => entry.targetKind === "agent");
      const options = buildAssistantAgentOptionsFromShelf(agentShelf, libraryByRef);
      // 同步补齐简介 / 库内头像；再 await 自建 getAgent 头像，避免聊天记录仍显示默认图标
      let enriched = enrichAssistantAgentDescriptions(agentShelf, options, libraryByRef);
      enriched = enrichAssistantAgentAvatars(enriched, libraryByRef);
      enriched = await hydrateAuthoredAgentAvatars(enriched, agentShelf);
      // 首屏会话回填可能早于本列表就绪，把缓存头像写回
      agentOptions.value = applyPendingAssistantAgentAvatars(enriched);
      hasUserAgents.value = options.length > 0;
    } catch {
      agentOptions.value = [];
      hasUserAgents.value = false;
    } finally {
      loading.value = false;
    }
  };

  const resolveInitialAgentId = (options: AssistantAgentOption[]): string => {
    const stored = readDefaultAgentId();
    if (stored && options.some((item) => item.id === stored)) {
      return stored;
    }
    return options[0]?.id ?? "";
  };

  return { agentOptions, hasUserAgents, loading, loadAgentOptions, resolveInitialAgentId };
}
