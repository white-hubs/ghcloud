import { shallowRef, type Ref } from "vue";

import {
  fetchAssistantAgentOptions,
  resolveAgentOptionId,
  SYSTEM_ASSISTANT_AGENTS,
  type AssistantAgentOption,
} from "./agent-display-service";
import { fetchAssistantSkillOptions } from "./ai-center/skill-service";
import { readDefaultAgentId } from "./chat/assistant-default-agent";
import type { SkillItem } from "./chat/types";

const sharedAgentOptions = shallowRef<AssistantAgentOption[]>([]);
const sharedHasUserAgents = shallowRef(false);
const sharedAgentLoading = shallowRef(false);

const sharedSkillOptions = shallowRef<SkillItem[]>([]);
const sharedSkillLoading = shallowRef(false);
const sharedSkillError = shallowRef("");

export { resolveAgentOptionId, SYSTEM_ASSISTANT_AGENTS, type AssistantAgentOption };

export const loadAssistantAgentOptions = async (): Promise<void> => {
  sharedAgentLoading.value = true;
  try {
    const options = await fetchAssistantAgentOptions();
    sharedAgentOptions.value = options;
    sharedHasUserAgents.value = options.length > 0;
  } catch {
    sharedAgentOptions.value = [];
    sharedHasUserAgents.value = false;
  } finally {
    sharedAgentLoading.value = false;
  }
};

export function resolveInitialAssistantAgentId(options: readonly AssistantAgentOption[]): string {
  const stored = readDefaultAgentId();
  if (stored && options.some((item) => item.id === stored)) {
    return stored;
  }
  return options[0]?.id ?? "";
}

export function useAssistantAgentOptions(): {
  agentOptions: Ref<AssistantAgentOption[]>;
  hasUserAgents: Ref<boolean>;
  loading: Ref<boolean>;
  loadAgentOptions: () => Promise<void>;
  resolveInitialAgentId: (options: readonly AssistantAgentOption[]) => string;
} {
  return {
    agentOptions: sharedAgentOptions,
    hasUserAgents: sharedHasUserAgents,
    loading: sharedAgentLoading,
    loadAgentOptions: loadAssistantAgentOptions,
    resolveInitialAgentId: resolveInitialAssistantAgentId,
  };
}

export const loadAssistantSkillOptions = async (): Promise<void> => {
  sharedSkillLoading.value = true;
  sharedSkillError.value = "";
  try {
    sharedSkillOptions.value = await fetchAssistantSkillOptions();
  } catch {
    sharedSkillOptions.value = [];
    sharedSkillError.value = "技能加载失败";
    throw new Error(sharedSkillError.value);
  } finally {
    sharedSkillLoading.value = false;
  }
};

export function useAssistantSkillOptions(): {
  skillOptions: Ref<SkillItem[]>;
  loading: Ref<boolean>;
  error: Ref<string>;
  loadSkillOptions: () => Promise<void>;
} {
  return {
    skillOptions: sharedSkillOptions,
    loading: sharedSkillLoading,
    error: sharedSkillError,
    loadSkillOptions: loadAssistantSkillOptions,
  };
}
