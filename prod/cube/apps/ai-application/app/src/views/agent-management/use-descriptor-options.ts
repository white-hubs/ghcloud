import { ref, type Ref } from "vue";

import { agentConsoleClient } from "@/api/agent-console-client";

export interface PublishedDescriptorOption {
  id: string;
  name: string;
  description: string;
}

export function usePublishedSkills(): {
  skillOptions: Ref<PublishedDescriptorOption[]>;
  loading: Ref<boolean>;
  loadPublishedSkills: () => Promise<void>;
} {
  const skillOptions = ref<PublishedDescriptorOption[]>([]);
  const loading = ref(false);

  const loadPublishedSkills = async (): Promise<void> => {
    loading.value = true;
    try {
      const items = await agentConsoleClient.listSkills();
      skillOptions.value = items
        .filter((item) => item.status === "published")
        .map((item) => {
          // listSkills 不再返回 instructions；选项只用 description / displayName
          const content = item.content as { description?: string; displayName?: string };
          const description = content.description?.trim() || "技能";
          const displayName = content.displayName?.trim();
          return { id: item.id, name: displayName || item.name, description };
        });
    } catch {
      skillOptions.value = [];
    } finally {
      loading.value = false;
    }
  };

  return { skillOptions, loading, loadPublishedSkills };
}

export function usePublishedRules(): {
  ruleOptions: Ref<PublishedDescriptorOption[]>;
  loading: Ref<boolean>;
  loadPublishedRules: () => Promise<void>;
} {
  const ruleOptions = ref<PublishedDescriptorOption[]>([]);
  const loading = ref(false);

  const loadPublishedRules = async (): Promise<void> => {
    loading.value = true;
    try {
      const items = await agentConsoleClient.listRules();
      ruleOptions.value = items
        .filter((item) => item.status === "published")
        .map((item) => {
          const content = item.content as { description?: string; content?: string; displayName?: string };
          const description = content.description?.trim() || content.content?.trim() || "规则";
          return { id: item.id, name: content.displayName?.trim() || item.name, description };
        });
    } catch {
      ruleOptions.value = [];
    } finally {
      loading.value = false;
    }
  };

  return { ruleOptions, loading, loadPublishedRules };
}
